require 'tracks/points'
require 'tracks/points_processor'

class Track < ActiveRecord::Base
  belongs_to :user
  belongs_to :pilot,
             class_name: 'UserProfile',
             foreign_key: 'user_profile_id'

  belongs_to :place
  belongs_to :wingsuit
  has_many :tracksegments, dependent: :destroy
  has_many :points, through: :tracksegments
  has_many :track_results, dependent: :destroy
  has_many :virtual_comp_results, dependent: :destroy
  has_one :event_track

  has_one :time,
          -> { where(discipline: TrackResult.disciplines[:time]) }, 
          class_name: 'TrackResult'
  has_one :distance, 
          -> { where(discipline: TrackResult.disciplines[:distance]) },
          class_name: 'TrackResult'
  has_one :speed,
          -> { where(discipline: TrackResult.disciplines[:speed]) },
          class_name: 'TrackResult'

  attr_accessor :trackfile, :track_index

  enum kind: [:skydive, :base]
  enum visibility: [:public_track, :unlisted_track, :private_track]
  enum gps_type: [:gpx, :flysight, :columbus, :wintec]

  validates :name, :location, presence: true

  before_save :parse_file

  def competitive?
    event_track.present?
  end

  def charts_data
    track_data.trimmed.to_json.html_safe
  end

  def earth_data
    track_data.trimmed.map { |x| {latitude: x[:latitude],
                                  longitude: x[:longitude],
                                  h_speed: x[:h_speed],
                                  elevation: x[:abs_altitude].nil? ? x[:elevation] : x[:abs_altitude]} }
                    .to_json.html_safe
  end

  def max_height
    track_data.max_h.round
  end

  def min_height
    track_data.min_h.round
  end

  def heights_data
    track_data.points.map { |p| [p[:fl_time_abs], p[:elevation]] }.to_json.html_safe
  end

  def duration
    track_data.points.map { |p| p[:fl_time] }.inject(0, :+)
  end

  def presentation
    "#{name} | #{suit} | #{comment}"
  end

  private

  def track_data
    @track_points ||= TrackPoints.new(self)
  end

  def parse_file
    if self.new_record?
      file_data = TrackPointsProcessor.process_file(trackfile[:data], trackfile[:ext], track_index)
      track_points = file_data[:points]
      return false unless track_points

      self.gps_type = file_data[:gps_type]

      set_jump_range track_points

      # Place
      if self.ff_start
        start_point = track_points.detect { |x| x[:fl_time] >= self.ff_start }
        self.place = Place.nearby(
          start_point[:latitude], 
          start_point[:longitude],
          self.base? ? 1 : 10
        ).first if start_point
      end

      if self.place && self.place.msl
        track_points.each { |x| x[:elevation] = x[:abs_altitude] - self.place.msl }
      end

      record_points track_points
    end
  end

  def record_points(track_points)
    trkseg = Tracksegment.create
    tracksegments << trkseg

    Point.create (track_points) { |point| point.tracksegment = trkseg}
  end

  def set_jump_range(track_points)
    min_h = track_points.min_by { |x| x[:elevation] }[:elevation]
    max_h = track_points.max_by { |x| x[:elevation] }[:elevation]

    start_point = track_points.reverse.detect { |x| x[:elevation] >= (max_h - 15) }
    self.ff_start = start_point.present? ? start_point[:fl_time] : 0

    start_point = track_points.detect { |x| (x[:fl_time] > self.ff_start && x[:v_speed] > 25) }
    self.ff_start = start_point[:fl_time] if start_point.present?

    self.ff_end = track_points.detect{ |x| x[:elevation] < (min_h + 50) && x[:fl_time] > self.ff_start}[:fl_time] || track_points.last[:fl_time]
  end
end

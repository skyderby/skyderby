require 'tracks/points'
require 'tracks/points_processor'

class Track < ActiveRecord::Base
  belongs_to :user
  belongs_to :wingsuit
  has_one :event_track
  has_many :tracksegments, dependent: :destroy
  has_many :points, through: :tracksegments
  has_many :track_results

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

  validates :name, :location, :suit, presence: true
  before_save :parse_file, :calculate_results

  def competitive
    !event_track.nil?
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

  def calculate_results
    ff_start_elev = track_data.points.max_by { |x| x[:elevation] }[:elevation]
    ff_end_elev = track_data.points.min_by { |x| x[:elevation] }[:elevation] + 1000

    ff_start_elev = track_data.points.find { |x| x[:fl_time_abs] > ff_start }[:elevation] unless ff_start.nil? || ff_start.zero?
    ff_end_elev = track_data.points.find { |x| x[:fl_time_abs] > ff_end }[:elevation] if ff_end

    ff_start_elev -= ff_start_elev % 50
    ff_end_elev += 50 - ff_end_elev % 50

    results = []
    ff_range = ff_start_elev - ff_end_elev
    if ff_range > 1000
      steps = ((ff_range - 1000) / 50).floor

      steps.times do |s|
        res_range_from = ff_start_elev - 50 * s
        res_range_to = ff_start_elev - 1000 - 50 * s
        trk_points = track_data.trim_interpolize(res_range_from, res_range_to)
        fl_time = trk_points.map { |x| x[:fl_time] }.inject(0, :+)
        distance = trk_points.map { |x| x[:distance] }.inject(0, :+)
        speed = fl_time.zero? ? 0 : Velocity.to_kmh(distance / fl_time).round

        fl_time = 0 if fl_time > 300
        distance = 0 if distance > 9900
        speed = 0 if speed > 900

        results << {
          range_from: res_range_from,
          range_to: res_range_to,
          time: fl_time.round(1),
          distance: distance.round,
          speed: speed
        }
      end
    end
    track_results.each(&:delete)

    return if results.count == 0
    time = results.max_by { |x| x[:time] }
    track_results << TrackResult.new(discipline: :time,
                                     range_from: time[:range_from],
                                     range_to: time[:range_to],
                                     result: time[:time])

    distance = results.max_by { |x| x[:distance] }
    track_results << TrackResult.new(discipline: :distance,
                                     range_from: distance[:range_from],
                                     range_to: distance[:range_to],
                                     result: distance[:distance])

    speed = results.max_by { |x| x[:speed] }
    track_results << TrackResult.new(discipline: :speed,
                                     range_from: speed[:range_from],
                                     range_to: speed[:range_to],
                                     result: speed[:speed])
  end

  private

  def track_data
    @track_points ||= TrackPoints.new(self)
  end

  def parse_file
    if self.new_record?

      track_points = TrackPointsProcessor.process_file(trackfile[:data], trackfile[:ext], track_index)
      return false unless track_points

      record_points track_points
      set_jump_range track_points

    end
  end

  def record_points(track_points)
    trkseg = Tracksegment.create!
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

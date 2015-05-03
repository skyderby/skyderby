require 'tracks/points_processor'
require 'tracks/jump_range_finder'

class Track < ActiveRecord::Base
  enum kind: [:skydive, :base]
  enum visibility: [:public_track, :unlisted_track, :private_track]
  enum gps_type: [:gpx, :flysight, :columbus, :wintec]

  attr_accessor :file
  attr_accessor :trackfile, :track_index

  belongs_to :user
  belongs_to :pilot,
             class_name: 'UserProfile',
             foreign_key: 'user_profile_id'

  belongs_to :place
  belongs_to :wingsuit

  has_one :event_track
  has_one :video, class_name: 'TrackVideo', dependent: :destroy

  has_one :time,
          -> { where(discipline: TrackResult.disciplines[:time]) }, 
          class_name: 'TrackResult'
  has_one :distance, 
          -> { where(discipline: TrackResult.disciplines[:distance]) },
          class_name: 'TrackResult'
  has_one :speed,
          -> { where(discipline: TrackResult.disciplines[:speed]) },
          class_name: 'TrackResult'

  has_many :tracksegments, dependent: :destroy
  has_many :points, through: :tracksegments
  has_many :track_results, dependent: :destroy
  has_many :virtual_comp_results, dependent: :destroy

  validates :name, presence: true, if: :pilot_blank?

  before_save :ge_enabled!, :parse_file
  before_destroy :used_in_competition?

  has_attached_file :file

  delegate :tracksuit?, to: :wingsuit, allow_nil: true
  delegate :wingsuit?, to: :wingsuit, allow_nil: true

  def competitive?
    event_track.present?
  end

  def presentation
    "#{name} | #{suit} | #{comment}"
  end

  private

  def used_in_competition?
    errors.add(:base, "Cannot delete track used in competition") if competitive?
    errors.blank? #return false, to not destroy the element, otherwise, it will delete.
  end

  def pilot_blank?
    pilot.blank?
  end

  def ge_enabled!
    self.ge_enabled = true
  end

  # REFACTOR IT
  def parse_file
    if self.new_record?
      # Когда загружаем соревновательный трек - 
      # загрузка производится через api/round_tracks_controller
      # файл передается параметром
      if file.present?
        filename = file.original_filename
        self.trackfile = {
          data: File.read(file.queued_for_write[:original].path),
          ext: filename.downcase[filename.length - 4..filename.length-1]
        }
        self.track_index = 0
      end

      file_data = TrackPointsProcessor.process_file(trackfile[:data], trackfile[:ext], track_index)
      track_points = file_data[:points]
      return false unless track_points

      self.gps_type = file_data[:gps_type]

      jump_range = JumpRangeFinder.range_for track_points

      self.ff_start = jump_range.start_time
      self.ff_end = jump_range.end_time

      # Place
      search_radius = base? ? 1 : 10 # in km
      self.place = Place.nearby(jump_range.start_point, search_radius).first

      if self.place && self.place.msl
        track_points.each { |x| x[:elevation] = x[:abs_altitude] - self.place.msl }
      end

      record_points track_points
    end
  end

  def record_points(track_points)
    trkseg = Tracksegment.create
    tracksegments << trkseg

    track_points.each do |point|
      trkseg.points << Point.new(point.to_h.except(
        :fl_time_abs, 
        :elevation_diff,
        :glrat,
        :raw_gr,
        :raw_h_speed,
        :raw_v_speed
      ))
    end
  end
end

require 'tracks/points_processor'
require 'tracks/jump_range_finder'

class Track < ActiveRecord::Base
  enum kind:       [:skydive, :base]
  enum visibility: [:public_track, :unlisted_track, :private_track]
  enum gps_type:   [:gpx, :flysight, :columbus, :wintec, :cyber_eye]

  belongs_to :track_file

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

  validates :name, presence: true, if: 'pilot.blank?'

  # before_create :process_file
  before_destroy :used_in_competition?
  # after_save :unlink_file, on: :create
  after_commit :perform_jobs

  delegate :tracksuit?, to: :wingsuit, allow_nil: true
  delegate :wingsuit?, to: :wingsuit, allow_nil: true

  def competitive?
    event_track.present?
  end

  private

  def used_in_competition?
    errors.add(:base, 'Cannot delete track used in competition') if competitive?
    # return false, to not destroy the element, otherwise, it will delete.
    errors.blank?
  end

  # REFACTOR IT
  # def process_file
  #   if file.present?
  #     filename = file.original_filename
  #     trackfile = {
  #       data: File.read(file.queued_for_write[:original].path),
  #       ext: filename.downcase[filename.length - 4..filename.length - 1]
  #     }
  #   end
  #
  #   file_data = TrackPointsProcessor.process_file(
  #     trackfile[:data],
  #     trackfile[:ext],
  #     (track_index || 0).to_i
  #   )
  #
  #   track_points = file_data[:points]
  #   return false unless track_points
  #
  #   self.ff_start = jump_range.start_time
  #   self.ff_end = jump_range.end_time
  #
  #   if place && place.msl
  #     track_points.each { |x| x[:elevation] = x[:abs_altitude] - place.msl }
  #   end
  # end

  def perform_jobs
    ResultsWorker.perform_async(id)
    VirtualCompWorker.perform_async(id)
  end

  class << self
    def search(query)
      where('LOWER(comment) LIKE ?', "%#{query.downcase}%")
    end
  end
end

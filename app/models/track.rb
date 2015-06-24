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

  before_destroy :used_in_competition?
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

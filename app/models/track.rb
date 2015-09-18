# == Schema Information
#
# Table name: tracks
#
#  id                :integer          not null, primary key
#  name              :string(255)
#  created_at        :datetime
#  lastviewed_at     :datetime
#  suit              :string(255)
#  comment           :text(65535)
#  location          :string(255)
#  user_id           :integer
#  kind              :integer          default(0)
#  wingsuit_id       :integer
#  ff_start          :integer
#  ff_end            :integer
#  ge_enabled        :boolean          default(TRUE)
#  visibility        :integer          default(0)
#  user_profile_id   :integer
#  place_id          :integer
#  gps_type          :integer          default(0)
#  file_file_name    :string(255)
#  file_content_type :string(255)
#  file_file_size    :integer
#  file_updated_at   :datetime
#  track_file_id     :integer
#  ground_level      :integer          default(0)
#

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

    def accessible_by(user)
      return public_track unless user && user.user_profile

      if user.has_role? :admin
        where('1 = 1')
      else
        where('user_profile_id = :profile OR visibility = 0', profile: user.user_profile)
      end
    end
  end
end

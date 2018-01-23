# == Schema Information
#
# Table name: tracks
#
#  id                                    :integer          not null, primary key
#  name                                  :string(510)
#  created_at                            :datetime
#  updated_at                            :datetime
#  suit                                  :string(510)
#  comment                               :text
#  location                              :string(510)
#  user_id                               :integer
#  kind                                  :integer          default("skydive")
#  wingsuit_id                           :integer
#  ff_start                              :integer
#  ff_end                                :integer
#  ge_enabled                            :boolean          default(TRUE)
#  visibility                            :integer          default("public_track")
#  profile_id                            :integer
#  place_id                              :integer
#  gps_type                              :integer          default("gpx")
#  file_file_name                        :string(510)
#  file_content_type                     :string(510)
#  file_file_size                        :integer
#  file_updated_at                       :datetime
#  track_file_id                         :integer
#  ground_level                          :decimal(5, 1)    default(0.0)
#  recorded_at                           :datetime
#  disqualified_from_online_competitions :boolean          default(FALSE), not null
#

class Track < ApplicationRecord
  enum kind:       [:skydive, :base]
  enum visibility: [:public_track, :unlisted_track, :private_track]
  enum gps_type:   [:gpx, :flysight, :columbus, :wintec, :cyber_eye, :kml]

  belongs_to :track_file

  belongs_to :user
  belongs_to :pilot,
             class_name: 'Profile',
             foreign_key: 'profile_id',
             optional: true

  belongs_to :place, optional: true
  belongs_to :suit, optional: true

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

  has_many :points, -> { order :gps_time_in_seconds }, dependent: :delete_all
  has_many :track_results, dependent: :destroy
  has_many :virtual_comp_results, dependent: :destroy
  has_many :weather_data, as: :weather_datumable

  validates :name, presence: true, unless: :pilot

  before_destroy :used_in_competition?

  delegate :tracksuit?, :wingsuit?, :slick?, to: :suit, allow_nil: true
  delegate :kind, to: :suit, allow_nil: true, prefix: true
  delegate :msl, to: :place, allow_nil: true, prefix: true
  delegate :name, to: :pilot, allow_nil: true, prefix: true
  delegate :name, to: :place, allow_nil: true, prefix: true
  delegate :name, to: :suit, allow_nil: true, prefix: true
  delegate :event, to: :event_track, allow_nil: true

  def competitive?
    event_track.present?
  end

  def msl_offset
    @msl_offset ||= begin
      if ground_level && ground_level > 0
        ground_level
      elsif place_msl
        place_msl
      else
        points.minimum(:abs_altitude) || 0
      end
    end
  end

  def start_time
    points.trimmed.first&.gps_time
  end

  def abs_altitude?
    ge_enabled
  end

  def point_altitude_field
    ("abs_altitude - #{msl_offset}" if abs_altitude?) || 'elevation'
  end

  def presentation
    "##{id} | #{recorded_at&.strftime('%Y-%m-%d')} | #{comment}"
  end

  def delete_results
    track_results.delete_all
  end

  def delete_online_competitions_results
    virtual_comp_results.delete_all
  end

  def altitude_bounds
    @altitude_bounds ||= begin
      query_result = PointsQuery.execute(self, freq_1Hz: true, trimmed: true, only: [:altitude])
      points_altitude = query_result.map { |val| val[:altitude] }
      points_altitude = [0] if points_altitude.blank?
      {
        max_altitude: points_altitude.max,
        min_altitude: points_altitude.min,
        elevation:    points_altitude.max - points_altitude.min
      }
    end
  end

  def recorded_at
    super || created_at
  end

  private

  def used_in_competition?
    errors.add(:base, 'Cannot delete track used in competition') if competitive?
    throw(:abort) if errors.present?
  end

  class << self
    def search(query)
      where('LOWER(comment) LIKE ?', "%#{query.downcase}%")
    end

    def accessible_by(user)
      return public_track unless user && user.profile

      if user.has_role? :admin
        where('1 = 1')
      else
        where('profile_id = :profile OR visibility = 0', profile: user.profile)
      end
    end
  end
end

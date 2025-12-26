# == Schema Information
#
# Table name: tracks
#
#  id                                    :integer          not null, primary key
#  name                                  :string(510)
#  created_at                            :datetime
#  updated_at                            :datetime
#  missing_suit_name                     :string(510)
#  comment                               :text
#  location                              :string(510)
#  user_id                               :integer
#  kind                                  :integer          default("skydive")
#  suit_id                               :integer
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
#  data_frequency                        :decimal(3, 1)
#  missing_ranges                        :jsonb
#  require_range_review                  :boolean          default(FALSE), not null
#

class Track < ApplicationRecord
  include Ownerable, WeatherData

  enum :kind, { skydive: 0, base: 1, speed_skydiving: 2 }
  enum :visibility, { public_track: 0, unlisted_track: 1, private_track: 2 }
  enum :gps_type, { gpx: 0, flysight: 1, columbus: 2, wintec: 3, cyber_eye: 4, kml: 5, flysight2: 6 }

  belongs_to :track_file, class_name: 'Track::File', optional: true

  belongs_to :pilot,
             class_name: 'Profile',
             foreign_key: 'profile_id',
             optional: true,
             inverse_of: :tracks

  belongs_to :place, optional: true
  belongs_to :suit, optional: true

  has_one :event_result, class_name: 'PerformanceCompetition::Result', dependent: :restrict_with_error
  has_one :video, class_name: 'TrackVideo', dependent: :destroy, inverse_of: :track

  has_one :time,
          -> { where(discipline: Result.disciplines[:time]) },
          class_name: 'Track::Result',
          inverse_of: :track,
          dependent: :destroy

  has_one :distance,
          -> { where(discipline: Result.disciplines[:distance]) },
          class_name: 'Track::Result',
          inverse_of: :track,
          dependent: :destroy

  has_one :speed,
          -> { where(discipline: Result.disciplines[:speed]) },
          class_name: 'Track::Result',
          inverse_of: :track,
          dependent: :destroy

  has_many :points, -> { order :gps_time_in_seconds }, dependent: :delete_all, inverse_of: :track
  has_many :results, dependent: :destroy
  has_many :virtual_competition_results,
           -> { wind_cancellation(false) },
           class_name: 'VirtualCompetition::Result',
           inverse_of: :track,
           dependent: :destroy
  has_many :all_virtual_competition_results, class_name: 'VirtualCompetition::Result', dependent: :destroy

  validates :name, presence: true, unless: :pilot

  before_destroy :used_in_competition?
  after_create_commit :track_amplitude_event

  scope :chronologically, -> { order(id: :desc) }
  scope :sorted_by_speed, ->(dir) { left_joins(:speed).order("track_results.result #{dir} NULLS LAST") }
  scope :sorted_by_distance, ->(dir) { left_joins(:distance).order("track_results.result #{dir} NULLS LAST") }
  scope :sorted_by_time, ->(dir) { left_joins(:time).order("track_results.result #{dir} NULLS LAST") }
  scope :by_year, ->(year) { where('EXTRACT(YEAR FROM tracks.recorded_at) = ?', year) }

  delegate :tracksuit?, :wingsuit?, :slick?, to: :suit, allow_nil: true
  delegate :kind, to: :suit, allow_nil: true, prefix: true
  delegate :msl, to: :place, allow_nil: true, prefix: true
  delegate :name, to: :pilot, allow_nil: true, prefix: true
  delegate :name, to: :place, allow_nil: true, prefix: true
  delegate :name, to: :suit, allow_nil: true, prefix: true
  delegate :event, to: :event_result, allow_nil: true

  def jump_range = "#{ff_start};#{ff_end}"

  def jump_range=(val)
    self.ff_start, self.ff_end = val.split(';')
  end

  def duration = (points.last.gps_time_in_seconds - points.first.gps_time_in_seconds).to_i

  def competitive? = event_result.present?

  def msl_offset
    @msl_offset ||=
      if ground_level&.positive?
        ground_level
      elsif place_msl
        place_msl
      else
        points.minimum(:abs_altitude) || 0
      end
  end

  def start_time = points.trimmed.first&.gps_time

  def abs_altitude? = ge_enabled

  def point_altitude_field = ("abs_altitude - #{msl_offset}" if abs_altitude?) || 'elevation'

  def delete_results = results.delete_all

  def delete_online_competitions_results = all_virtual_competition_results.delete_all

  def altitude_bounds
    @altitude_bounds ||= begin
      points_altitude =
        PointsQuery
        .execute(self, freq_1hz: true, trimmed: true, only: [:altitude])
        .pluck(:altitude)

      points_altitude = [0] if points_altitude.blank?
      {
        max_altitude: points_altitude.max,
        min_altitude: points_altitude.min,
        elevation: points_altitude.max - points_altitude.min
      }
    end
  end

  def recorded_at = super || created_at

  private

  def used_in_competition?
    errors.add(:base, 'Cannot delete track used in competition') if competitive?
    throw(:abort) if errors.present?
  end

  def track_amplitude_event
    return unless belongs_to_user?

    Amplitude.track(
      user_id: owner_id,
      event: 'track_uploaded',
      properties: {
        kind:, visibility:, country: place&.country&.code
      }
    )
  end

  class << self
    def search(query)
      return all if query.blank?

      where('unaccent(comment) ILIKE unaccent(?)', "%#{query}%")
    end

    def accessible(user: Current.user)
      return public_track unless user&.profile

      if user.admin?
        all
      else
        where('profile_id = :profile OR visibility = 0', profile: user.profile)
      end
    end

    def sorted(attribute, direction)
      return chronologically if !allowed_attribute_to_sort?(attribute) || %i[asc desc].exclude?(direction)

      case attribute
      when 'speed' then sorted_by_speed(direction)
      when 'distance' then sorted_by_distance(direction)
      when 'time' then sorted_by_time(direction)
      else order(attribute => direction)
      end
    end

    def allowed_attribute_to_sort?(attribute)
      %w[speed distance time id recorded_at].include?(attribute)
    end
  end
end

class Place < ApplicationRecord
  include Permissions, Photos, Stats, WeatherData

  enum :kind, { skydive: 0, base: 1 }

  SEARCH_RADIUS = { 'base' => 0.1, 'skydive' => 5.0 }.freeze
  DUPLICATE_RADIUS = { 'base' => 0.02, 'skydive' => 0.5 }.freeze

  attr_reader :allow_duplicate
  attr_accessor :anchor

  belongs_to :country

  has_many :tracks, inverse_of: :place, dependent: :nullify
  has_many :pilots, -> { distinct }, through: :tracks
  has_many :events, dependent: :restrict_with_error
  has_many :weather_data, dependent: :delete_all
  has_many :terrain_profiles, dependent: :nullify
  has_many :finish_lines, dependent: :destroy
  has_one :submission, dependent: :destroy

  before_destroy :destroy_shared_terrain_profiles, prepend: true

  validates :name, :latitude, :longitude, presence: true
  validates :latitude, numericality: { greater_than_or_equal_to: -90, less_than_or_equal_to: 90 },
                       allow_nil: true
  validates :longitude, numericality: { greater_than_or_equal_to: -180, less_than_or_equal_to: 180 },
                        allow_nil: true
  validates :msl, numericality: { greater_than: -10_000, less_than: 10_000 }, allow_nil: true
  validate :no_duplicate_nearby, on: :create, unless: :allow_duplicate
  validate :close_to_anchor, if: -> { anchor.present? }

  delegate :name, :code, to: :country, prefix: true, allow_nil: true

  def allow_duplicate=(value)
    @allow_duplicate = ActiveModel::Type::Boolean.new.cast(value)
  end

  def duplicate_nearby
    return if latitude.blank? || longitude.blank?

    Place
      .where(kind: kind)
      .where.not(id: id)
      .nearby({ latitude: latitude, longitude: longitude }, DUPLICATE_RADIUS.fetch(kind, 0))
      .first
  end

  def accessible_profiles
    Profile.where(
      id: Track.accessible
               .where(place_id: id)
               .select(:profile_id)
               .distinct
    )
  end

  def visited_profiles_sample(limit: 10)
    accessible_profiles
      .order(Arel.sql('userpic_data IS NOT NULL DESC'), Arel.sql('RANDOM()'))
      .limit(limit)
  end

  def recent_trajectories(limit: 50)
    Rails.cache.fetch("places/#{id}/recent_trajectories/#{limit}", expires_in: 15.minutes) do
      tracks
        .public_track
        .chronologically
        .limit(limit)
        .map { |track| { id: track.id, points: trajectory_points(track) } }
        .reject { |trajectory| trajectory[:points].blank? }
    end
  end

  def destroy_shared_terrain_profiles
    terrain_profiles.shared.destroy_all
  end
  private :destroy_shared_terrain_profiles

  def no_duplicate_nearby
    duplicate = duplicate_nearby
    return unless duplicate

    errors.add(:base, :duplicate_nearby, name: duplicate.name)
  end
  private :no_duplicate_nearby

  def close_to_anchor
    return if latitude.blank? || longitude.blank?

    limit = SEARCH_RADIUS.fetch(kind, 0) * 1000
    return if Skyderby::Geospatial.distance_between_points(anchor, self) <= limit

    errors.add(:base, :too_far_from_anchor, distance: limit.round)
  end
  private :close_to_anchor

  def trajectory_points(track)
    PointsQuery
      .execute(track, trimmed: true, freq_1hz: true, only: %i[latitude longitude h_speed])
      .map do |point|
        latitude, longitude, h_speed = point.values
        { latitude:, longitude:, h_speed: }
      end
  end
  private :trajectory_points

  class << self
    def search(query)
      return all if query.blank?

      joins(:country).where(
        'unaccent(places.name) ILIKE unaccent(:query) OR unaccent(countries.name) ILIKE unaccent(:query)',
        query: "%#{query}%"
      )
    end

    def nearby(point, radius)
      distance_statement =
        Arel.sql("SQRT(
          POW(111 * (latitude - #{point[:latitude]}), 2) +
          POW(111 * (#{point[:longitude]} - longitude) * COS(latitude / (180/PI()) ), 2)
        )")

      where("#{distance_statement} < :radius", radius: radius).order(distance_statement)
    end

    def to_subregion
      select(
        'floor(min(latitude)) - 0.25 bottom_lat',
        'ceil(max(latitude)) + 0.25 top_lat',
        'floor(min(longitude)) - 0.25 left_lon',
        'ceil(max(longitude)) + 0.25 right_lon'
      ).take.attributes.except('id')
    end
  end
end

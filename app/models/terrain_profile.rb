class TerrainProfile < ApplicationRecord
  include Permissions

  MEASUREMENT_LINE = /\A(-?\d+(?:[.,]\d+)?)[\s,;]+(-?\d+(?:[.,]\d+)?)\z/

  belongs_to :user, optional: true
  belongs_to :place, optional: true, touch: true
  belongs_to :track, optional: true

  has_many :measurements,
           -> { order(:altitude) },
           dependent: :delete_all,
           inverse_of: :terrain_profile

  validates :name, presence: true
  validates :place, :track, presence: true, if: :published?
  validate :track_recorded_at_place, if: :published?
  validate :measurement_rows_parsed, if: :measurements_text_assigned?

  before_save :apply_measurements_text, if: :measurements_text_assigned?

  attr_accessor :ownership

  scope :published, -> { where.not(published_at: nil) }
  scope :shared, -> { where(user_id: nil) }
  scope :publicly_listed, -> { published.or(shared) }
  scope :with_place, -> { eager_load(:place) }
  scope :with_measurements, -> { where(id: Measurement.select(:terrain_profile_id)) }
  scope :owned_by, ->(user) { where(user_id: user.id) }
  scope :alphabetically, lambda {
    with_place.order(
      Arel.sql(
        'LOWER(COALESCE(places.name, terrain_profiles.name)), LOWER(terrain_profiles.name)'
      )
    )
  }

  def published? = published_at.present?

  alias published published?

  def published=(value)
    return if ActiveModel::Type::Boolean.new.cast(value) == published?

    self.published_at = published? ? nil : Time.current
  end

  def full_name
    place ? "#{place.name} - #{name}" : name
  end

  def measurements_text
    return @measurements_text if measurements_text_assigned?

    measurements.map { |measurement| "#{measurement.altitude} #{measurement.distance}" }
                .join("\n")
  end

  def measurements_text=(value)
    @measurements_text = value.to_s
    @measurement_rows = nil
  end

  class << self
    def default_for(place, user = Current.user)
      return if place.blank?

      candidates = viewable(user).where(place_id: place.id).with_measurements.alphabetically
      own = user&.registered? ? candidates.find_by(user_id: user.id) : nil

      own || candidates.first
    end

    def search(query)
      return all if query.blank?

      with_place.where(
        'unaccent(terrain_profiles.name) ILIKE unaccent(:query) ' \
        'OR unaccent(places.name) ILIKE unaccent(:query)',
        query: "%#{query}%"
      )
    end
  end

  private

  def measurements_text_assigned? = !@measurements_text.nil?

  def measurement_rows
    @measurement_rows ||=
      @measurements_text.to_s.lines.map(&:strip).reject(&:empty?).map { parse_measurement(it) }
  end

  def parse_measurement(line)
    captures = MEASUREMENT_LINE.match(line)&.captures
    return nil unless captures

    captures.map { |value| value.tr(',', '.').to_f.round }
  end

  def measurement_rows_parsed
    return unless measurement_rows.any?(&:nil?)

    errors.add(:measurements_text, :invalid_format)
  end

  def apply_measurements_text
    self.measurements = measurement_rows.map do |(altitude, distance)|
      Measurement.new(altitude:, distance:)
    end
  end

  def track_recorded_at_place
    return if track.blank? || place.blank?
    return if track.place_id == place_id

    errors.add(:track_id, :not_at_place)
  end
end

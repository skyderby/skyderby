module Tracks
  class NewPlace < SimpleDelegator
    SUGGESTIONS_LIMIT = 5

    attr_reader :track

    def initialize(track, attributes = nil)
      @track = track
      super(build_place(attributes))
    end

    def anchor_point = @anchor_point ||= track.place_anchor_point

    def anchor_available? = anchor_point.present?

    def draggable_pin? = skydive?

    def suggestions
      @suggestions ||= find_suggestions
    end

    def distance_to(other)
      Skyderby::Geospatial.distance_between_points(anchor_point, other).round
    end

    def save(user:)
      place = __getobj__
      saved = false

      Place.transaction do
        next unless place.save

        Place::Submission.create!(place:, user:, track:)
        track.update!(place:, ground_level: place.msl || track.ground_level)
        saved = true
      end

      saved
    end

    private

    def find_suggestions
      return [] unless anchor_available?

      Place
        .includes(:country)
        .where(kind: kind)
        .nearby(anchor_point, Place::SEARCH_RADIUS.fetch(kind))
        .limit(SUGGESTIONS_LIMIT)
        .to_a
    end

    def build_place(attributes)
      values = default_attributes.with_indifferent_access
      values.merge!(attributes.to_h) if attributes
      values.merge!(enforced_attributes)

      Place.new(values)
    end

    def default_attributes
      {
        kind: track.place_kind,
        latitude: anchor_point&.latitude,
        longitude: anchor_point&.longitude,
        msl: default_msl
      }
    end

    def enforced_attributes
      attributes = { kind: track.place_kind, anchor: anchor_point }
      return attributes unless track.base? && anchor_available?

      attributes.merge(latitude: anchor_point.latitude, longitude: anchor_point.longitude)
    end

    def default_msl
      return if track.base?

      track.landing_point&.abs_altitude&.round(1)
    end
  end
end

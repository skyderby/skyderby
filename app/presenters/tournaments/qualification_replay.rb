module Tournaments
  class QualificationReplay
    SECONDS_BEFORE_START = 2
    SECONDS_AFTER_END = 5
    COLORS = %w[#38d2ff #ff7a3c].freeze

    Side = Struct.new(
      :name, :bib, :country_code, :country_name, :suit, :photo_url, :color, :result, :path,
      keyword_init: true
    )

    def initialize(tournament, competitor_a, competitor_b)
      @tournament = tournament
      @competitors = [competitor_a, competitor_b]
    end

    def present?
      @competitors.all? { |competitor| competitor&.best_jump&.track }
    end

    def sides
      @sides ||= @competitors.each_with_index.map do |competitor, index|
        Side.new(
          name: competitor.name,
          bib: competitor.rank,
          country_code: competitor.country_code,
          country_name: competitor.country_name,
          suit: [competitor.suit&.manufacturer_code, competitor.suit_name].compact.join(' '),
          photo_url: (competitor.photo_url(:medium) if competitor.photo),
          color: COLORS[index],
          result: competitor.best_jump.result&.to_f,
          path: track_path(competitor.best_jump.track)
        )
      end
    end

    def finish_line
      return unless @tournament.finish_line

      @tournament.finish_line.to_coordinates.map do |point|
        { lat: point[:latitude].to_f, lng: point[:longitude].to_f }
      end
    end

    def as_json(*)
      {
        finishLine: finish_line,
        sides: sides.map do |side|
          {
            name: side.name,
            bib: side.bib,
            countryCode: side.country_code,
            countryName: side.country_name,
            suit: side.suit,
            photoUrl: side.photo_url,
            color: side.color,
            result: side.result,
            path: side.path
          }
        end
      }
    end

    private

    def track_path(track)
      PointsQuery
        .execute(
          track,
          trimmed: { seconds_before_start: SECONDS_BEFORE_START, seconds_after_end: SECONDS_AFTER_END },
          only: %i[fl_time latitude longitude h_speed v_speed]
        )
        .map do |point|
          {
            flTime: point[:fl_time].to_f,
            lat: point[:latitude].to_f,
            lng: point[:longitude].to_f,
            hSpeed: point[:h_speed].to_f,
            vSpeed: point[:v_speed].to_f
          }
        end
    end
  end
end

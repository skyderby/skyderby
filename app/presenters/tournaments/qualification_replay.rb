module Tournaments
  class QualificationReplay
    SECONDS_BEFORE_START = 2
    SECONDS_AFTER_END = 5
    COLORS = %w[#ff7a1a #a855f7].freeze

    Side = Struct.new(
      :name, :bib, :country_code, :country_name, :suit, :photo_url, :color, :result,
      :sync_fl_time, :path,
      keyword_init: true
    )

    def initialize(tournament, entry_a, entry_b)
      @tournament = tournament
      @entries = [entry_a, entry_b]
    end

    # Stable id keyed on the compared tracks so a Turbo morph refresh preserves
    # the slide (and its permanent map) instead of tearing it down and paying
    # Google Cloud for another map initialisation.
    def dom_id
      @dom_id ||= "replay-#{@entries.map { |(_competitor, jump)| jump&.track_id }.join('-')}"
    end

    def present?
      @entries.all? { |(_competitor, jump)| jump&.track } &&
        sides.all? { |side| side.path.present? }
    end

    def sides
      @sides ||= @entries.each_with_index.map do |(competitor, jump), index|
        Side.new(
          name: competitor.name,
          bib: competitor.rank,
          country_code: competitor.country_code,
          country_name: competitor.country_name,
          suit: [competitor.suit&.manufacturer_code, competitor.suit_name].compact.join(' '),
          photo_url: (competitor.photo_url(:medium) if competitor.photo),
          color: COLORS[index],
          result: jump.result&.to_f,
          sync_fl_time: race_start_fl_time(jump),
          path: track_path(jump.track)
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
            syncFlTime: side.sync_fl_time,
            path: side.path
          }
        end
      }
    end

    private

    # Race start (when the competitor crosses the start) as a track-relative
    # fl_time, or nil when no start time was recorded for the jump.
    def race_start_fl_time(jump)
      target = jump.start_time
      return unless target

      PointsQuery
        .execute(jump.track, only: %i[gps_time fl_time])
        .each_cons(2) do |a, b|
          next unless target.between?(a[:gps_time], b[:gps_time])

          span = b[:gps_time] - a[:gps_time]
          ratio = span.zero? ? 0 : (target - a[:gps_time]) / span
          return a[:fl_time].to_f + (b[:fl_time].to_f - a[:fl_time].to_f) * ratio
        end

      nil
    end

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

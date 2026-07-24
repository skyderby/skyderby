module Profiles
  class Journal < SimpleDelegator
    MODES = %i[performance base speed].freeze
    ACTIVITY_BY_MODE = { performance: :skydive, base: :base, speed: :speed_skydiving }.freeze

    PERIODS = %w[1m 3m 6m 1y].freeze
    PERIOD_MONTHS = { '1m' => 1, '3m' => 3, '6m' => 6, '1y' => 12 }.freeze
    DEFAULT_PERIOD = '1y'.freeze

    Task = Struct.new(:key, :higher_is_better, :unit, :series, keyword_init: true)
    Series = Struct.new(:key, :points, keyword_init: true)
    Point = Struct.new(:x, :y, :date, :track_id, :suit, :place, :comment, keyword_init: true)

    Definition = Struct.new(:key, :discipline, :variant, :grouping, :unit, keyword_init: true)

    DEFINITIONS = {
      performance: [
        Definition.new(key: :speed, discipline: :speed, variant: Track::Result::COMPETITION_VARIANT, grouping: :suit,
                       unit: :kmh),
        Definition.new(key: :distance, discipline: :distance, variant: Track::Result::COMPETITION_VARIANT,
                       grouping: :single, unit: :m),
        Definition.new(key: :time, discipline: :time, variant: Track::Result::COMPETITION_VARIANT, grouping: :single,
                       unit: :sec),
        Definition.new(key: :flare, discipline: :flare, variant: 'default', grouping: :single, unit: :m)
      ],
      base: [
        Definition.new(key: :base_race, discipline: :base_race, variant: :any, grouping: :location, unit: :sec),
        Definition.new(key: :distance_in_time, discipline: :distance_in_time, variant: :any, grouping: :variant,
                       unit: :m),
        Definition.new(key: :flare, discipline: :flare, variant: 'default', grouping: :single, unit: :m)
      ],
      speed: [
        Definition.new(key: :vertical_speed, discipline: :vertical_speed, variant: 'default', grouping: :single,
                       unit: :kmh)
      ]
    }.freeze

    def initialize(profile, user: nil, mode: nil, period: nil)
      super(profile)
      @user = user
      @requested_mode = mode.presence&.to_sym
      @requested_period = period.presence
    end

    def profile = __getobj__

    def available_modes
      @available_modes ||= MODES.select { |mode| tracks.exists?(kind: ACTIVITY_BY_MODE[mode]) }
    end

    def any_modes? = available_modes.any?

    def current_mode
      @current_mode ||=
        [@requested_mode].compact.find { |mode| available_modes.include?(mode) } || available_modes.first
    end

    def current_activity = ACTIVITY_BY_MODE.fetch(current_mode, :skydive)

    def periods = PERIODS

    def period
      @period ||= begin
        value = @requested_period || @user&.setting&.journal_period
        PERIODS.include?(value.to_s) ? value.to_s : DEFAULT_PERIOD
      end
    end

    def tasks
      @tasks ||= DEFINITIONS.fetch(current_mode, []).filter_map { |definition| build_task(definition) }
    end

    private

    def build_task(definition)
      rows = results_for(definition)
      return if rows.empty?

      numbers = attempt_numbers(rows)

      Task.new(
        key: definition.key,
        higher_is_better: Track::Result.higher_is_better?(definition.discipline),
        unit: definition.unit,
        series: build_series(definition, rows, numbers)
      )
    end

    def attempt_numbers(rows)
      ordered = rows.map(&:track).uniq(&:id).sort_by(&:recorded_at)
      ordered.each_with_index.to_h { |track, index| [track.id, index + 1] }
    end

    def build_series(definition, rows, numbers)
      rows
        .group_by { |row| series_key(definition, row) }
        .map do |key, group|
          points = group.sort_by { |row| numbers[row.track_id] }.map do |row|
            track = row.track
            Point.new(
              x: numbers[row.track_id],
              y: row.result,
              date: track.recorded_at.to_date.iso8601,
              track_id: row.track_id,
              suit: track.suit,
              place: track.place,
              comment: track.comment.presence
            )
          end
          Series.new(key: key, points: points)
        end
    end

    def series_key(definition, row)
      case definition.grouping
      when :suit then row.track.suit_kind || 'unknown'
      when :variant then row.variant
      when :location then row.track.place_name || 'unknown'
      else 'default'
      end
    end

    def results_for(definition)
      scope = Track::Result
              .where(discipline: definition.discipline)
              .joins(:track)
              .where(tracks: { profile_id: id, kind: Track.kinds[current_activity.to_s], recorded_at: period_start.. })
              .includes(track: [{ place: :country }, { suit: :manufacturer }])
      scope = scope.where(variant: definition.variant) unless definition.variant == :any
      rows = scope.to_a
      definition.grouping == :location ? primary_finish_line_rows(rows) : rows
    end

    def period_start = PERIOD_MONTHS.fetch(period).months.ago

    def primary_finish_line_rows(rows)
      rows.group_by(&:track_id).map do |_track_id, track_rows|
        preferred_id = race_finish_line_id(track_rows.first.track)
        track_rows.find { |row| row.variant.to_i == preferred_id } ||
          track_rows.min_by { |row| row.variant.to_i }
      end
    end

    def race_finish_line_id(track)
      race = track.race_finish_line
      race && race[:finish_line]&.id
    end
  end
end

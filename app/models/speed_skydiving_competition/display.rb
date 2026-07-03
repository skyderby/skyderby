class SpeedSkydivingCompetition::Display < SimpleDelegator
  PALETTE = %w[#38d2ff #ff7a1a #36e07a #a855f7 #ffd23f #ff5a8a #23c4b8 #6c8cff].freeze
  MAX_FALLERS = 8

  def initialize(event)
    @event = event
    super(event)
  end

  def categories
    @categories ||= scoreboard.categories.filter_map do |data|
      rows = data[:standings].select { |row| row[:rank] && row[:total].positive? }
      Category.new(data[:category], rows) if rows.any?
    end
  end

  class Category
    delegate :name, to: :record
    delegate :size, to: :rows

    def initialize(record, rows)
      @record = record
      @rows = rows
    end

    def leaderboard
      @leaderboard ||= rows.map { |row| LeaderRow.new(row) }
    end

    def fallers
      @fallers ||=
        rows.first(MAX_FALLERS).each_with_index.filter_map do |row, index|
          Faller.build(row, PALETTE[index % PALETTE.size])
        end
    end

    private

    attr_reader :record, :rows
  end

  class LeaderRow
    delegate :name, :country_code, :country_name, to: :competitor

    def initialize(row)
      @row = row
    end

    def rank = @row[:rank]

    def average = @row[:average]

    def best = scored_results.map(&:final_result).max&.round(2)

    def jumps = scored_results.size

    private

    def competitor = @row[:competitor]

    def scored_results
      @scored_results ||= @row[:accountable_results].select { |result| result.final_result&.positive? }
    end
  end

  Faller = Struct.new(:name, :bib, :country_code, :color, :result, :points, keyword_init: true) do
    def self.build(row, color)
      result = best_scored_result(row)
      return unless result&.track

      points = trajectory(result.track)
      return if points.size < 2

      new(
        name: row[:competitor].name,
        bib: row[:rank],
        country_code: row[:competitor].country_code,
        color: color,
        result: result.final_result.round(2),
        points: points
      )
    end

    def self.best_scored_result(row)
      row[:accountable_results]
        .select { |result| result.final_result&.positive? }
        .max_by(&:final_result)
    end

    def self.trajectory(track)
      window = SpeedSkydivingCompetition::ResultScore.new(track).window_trajectory
      return [] if window.size < 2

      start_time = window.first[:fl_time]
      raw = window.map do |point|
        {
          t: point[:fl_time] - start_time,
          alt: point[:altitude],
          speed: point[:full_speed] || Math.sqrt(point[:h_speed]**2 + point[:v_speed]**2)
        }
      end

      with_acceleration(raw)
    end

    def self.with_acceleration(points)
      points.each_with_index.map do |point, index|
        point.merge(
          t: point[:t].round(3),
          alt: point[:alt].round(1),
          speed: point[:speed].round(1),
          accel: acceleration(points, index).round(2)
        )
      end
    end

    def self.acceleration(points, index)
      prev = points[[index - 1, 0].max]
      succ = points[[index + 1, points.size - 1].min]
      span = succ[:t] - prev[:t]
      return 0.0 if span.zero?

      ((succ[:speed] - prev[:speed]) / 3.6) / span
    end

    def window_start = points.first[:alt]

    def window_end = points.last[:alt]

    def as_json(*)
      {
        name: name,
        bib: bib,
        color: color,
        result: result,
        windowStart: window_start,
        windowEnd: window_end,
        points: points
      }
    end
  end

  private

  def scoreboard = @scoreboard ||= @event.standings
end

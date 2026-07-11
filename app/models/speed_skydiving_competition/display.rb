class SpeedSkydivingCompetition::Display < SimpleDelegator
  PALETTE = %w[#38d2ff #ff7a1a #36e07a #a855f7 #ffd23f #ff5a8a #23c4b8 #6c8cff].freeze
  MAX_FALLERS = 8
  SPEED_WINDOW = 3 # seconds — speed skydiving scores the best 3s average vertical speed

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

    def fall_pairs
      fallers.each_slice(2).to_a
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

    def total = @row[:total]

    def best = best_record&.final_result&.round(2)

    def best_round = best_record&.round_number

    def jumps = scored_results.size

    def attempts
      scored_results.sort_by(&:round_number).map do |result|
        Attempt.new(result.round_number, result.final_result.round(2), result == best_record)
      end
    end

    private

    def competitor = @row[:competitor]

    def best_record = scored_results.max_by(&:final_result)

    def scored_results
      @scored_results ||= @row[:accountable_results].select { |result| result.final_result&.positive? }
    end
  end

  Attempt = Struct.new(:round, :speed, :best)

  Faller = Struct.new(
    :name, :bib, :country_code, :country_name, :photo_url, :color, :result, :points,
    keyword_init: true
  ) do
    extend SideViewTrajectory

    def self.build(row, color)
      result = best_scored_result(row)
      return unless result&.track

      points = trajectory(result.track)
      return if points.size < 2

      competitor = row[:competitor]
      new(
        name: competitor.name,
        bib: row[:rank],
        country_code: competitor.country_code,
        country_name: competitor.country_name,
        photo_url: (competitor.photo_url(:medium) if competitor.photo),
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
      distance = 0.0
      previous = nil

      raw = window.map do |point|
        distance += horizontal_step(previous, point) if previous
        previous = point

        {
          t: point[:fl_time] - start_time,
          x: distance,
          alt: point[:altitude],
          vs: point[:v_speed] || 0
        }
      end

      with_acceleration(with_sliding_speed(raw))
    end

    # Vertical speed averaged over a trailing 3-second window — the same measure
    # speed skydiving scores (best 3s average altitude drop).
    def self.with_sliding_speed(points)
      points.each_with_index.map do |point, index|
        start = sliding_start(points, index)
        span = point[:t] - start[:t]
        speed = span.positive? ? (start[:alt] - point[:alt]) / span * 3.6 : 0.0
        point.merge(speed: speed)
      end
    end

    def self.sliding_start(points, index)
      target = points[index][:t] - SPEED_WINDOW
      start_index = index
      start_index -= 1 while start_index.positive? && points[start_index - 1][:t] >= target
      points[start_index]
    end

    def self.with_acceleration(points)
      points.each_with_index.map do |point, index|
        {
          t: point[:t].round(3),
          x: point[:x].round(1),
          alt: point[:alt].round(1),
          speed: point[:speed].round(1),
          accel: acceleration(points, index).round(2)
        }
      end
    end

    def self.acceleration(points, index)
      prev = points[[index - 1, 0].max]
      succ = points[[index + 1, points.size - 1].min]
      span = succ[:t] - prev[:t]
      return 0.0 if span.zero?

      ((succ[:vs] - prev[:vs]) / 3.6) / span
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

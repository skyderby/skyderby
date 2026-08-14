class Boogie::Display < SimpleDelegator
  PALETTE = %w[#470FF4 #F24C00 #36e07a #a855f7].freeze
  MAX_FALLERS = 8

  def initialize(event)
    @event = event
    super(event)
  end

  def categories
    @categories ||= scoreboard.categories.filter_map do |category, standings|
      rows = assign_ranks(standings.rows.map { |row| LeaderRow.new(row) }.select(&:scored?))
      Category.new(category, rows, @event.number_of_results_for_total) if rows.any?
    end
  end

  class Category
    delegate :name, to: :record
    delegate :size, to: :rows

    def initialize(record, rows, counting_results)
      @record = record
      @rows = rows
      @counting_results = counting_results
    end

    attr_reader :counting_results

    def leaderboard = rows

    def fallers
      @fallers ||=
        rows.first(MAX_FALLERS).each_with_index.filter_map do |row, index|
          Faller.build(row, PALETTE[index % PALETTE.size])
        end
    end

    def fall_pairs = fallers.each_slice(2).to_a

    private

    attr_reader :record, :rows
  end

  class LeaderRow
    attr_accessor :rank

    delegate :name, :country_code, :country_name, to: :competitor
    delegate :competitor, :total_points, to: :row

    def initialize(row)
      @row = row
    end

    def scored? = scored_results.any?

    def suit = [competitor.suit&.manufacturer_code, competitor.suit_name].compact.join(' ')

    def photo_url = (competitor.photo_url(:medium) if competitor.photo)

    def best = scored_results.max_by(&:scored_result)

    def best_round = best&.round_number

    def jumps = scored_results.size

    def attempts
      @attempts ||=
        scored_results.sort_by(&:round_number).map do |result|
          Attempt.new(
            result.round_number, result.scored_result, counting_results.include?(result), result == best
          )
        end
    end

    private

    attr_reader :row

    def counting_results = @counting_results ||= row.best_results

    def scored_results
      @scored_results ||= row.results.select { |result| result.result&.positive? }
    end
  end

  Attempt = Struct.new(:round, :result, :counting, :best)

  Faller = Struct.new(
    :name, :bib, :country_code, :country_name, :suit, :photo_url, :color, :result, :points,
    keyword_init: true
  ) do
    def self.build(row, color)
      record = row.best
      return unless record&.track

      points = PerformanceCompetition::Display::Trajectory.new(record).points
      return if points.size < 2

      new(
        name: row.name,
        bib: row.rank,
        country_code: row.country_code,
        country_name: row.country_name,
        suit: row.suit,
        photo_url: row.photo_url,
        color: color,
        result: record.scored_result.round,
        points: points
      )
    end

    def window_start = points.first[:alt]

    def window_end = points.last[:alt]

    def as_json(*)
      {
        name:,
        color:,
        result: format('%d', result),
        resultValue: result.to_f,
        windowStart: window_start,
        windowEnd: window_end,
        points:
      }
    end
  end

  private

  def scoreboard = @scoreboard ||= @event.standings

  def assign_ranks(rows)
    previous = nil

    rows.each_with_index do |row, index|
      shares_rank = previous && previous.total_points == row.total_points && row.total_points.positive?
      row.rank = shares_rank ? previous.rank : index + 1
      previous = row
    end
  end
end

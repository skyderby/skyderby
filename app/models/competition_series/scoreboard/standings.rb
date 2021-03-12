class CompetitionSeries::Scoreboard::Standings
  class Result
    attr_reader :record, :points, :best_result

    delegate :round, :competitor, :penalized, :penalty_size, :penalty_reason, to: :record

    def initialize(record)
      @record = record
      @best_result = false
    end

    def formatted_result
      return '' if result.zero? && !penalized

      if round.distance?
        format('%d', result.truncate)
      else
        format('%.1f', result)
      end
    end

    def formatted_points
      return '' if result.zero? && !penalized

      format('%.1f', points.to_f.round(1))
    end

    def result
      return 0 unless record.result_net

      (record.result_net - record.result_net / 100 * penalty_size.to_f)
        .round(round.distance? ? 0 : 1)
    end

    def calculate_points_from(best_result)
      return if result.zero? || best_result.zero?

      @points = result.to_d / best_result * 100
    end

    def best_result! = @best_result = true
  end

  class Row
    attr_accessor :rank
    attr_reader :competitor

    def initialize(competitor, results, rounds)
      @competitor = competitor
      @results = results
      @rounds = rounds
    end

    def total_points
      points_in_disciplines.sum { |_discipline, points| points }.round(1)
    end

    def points_in_disciplines
      @points_in_disciplines ||=
        rounds_by_discipline.each_with_object({}) do |(discipline, rounds), memo|
          sum_of_points =
            rounds
            .map { |round| result_in_round(round) }
            .compact
            .sum(&:points)

          memo[discipline] = sum_of_points.to_f / rounds.count
        end
    end

    def result_in_round(round)
      results.find { |result| round.includes?(result.round) }
    end

    private

    attr_reader :results, :rounds

    def rounds_by_discipline = rounds.group_by(&:discipline)
  end

  def self.build(*args)
    new(*args).build
  end

  def initialize(competitors, rounds, result_records)
    @competitors = competitors
    @rounds = rounds
    @result_records = result_records
  end

  def build
    calculate_points

    standings =
      competitors.map do |competitor|
        competitor_results = results.select { |result| result.competitor == competitor }
        Row.new(competitor, competitor_results, rounds)
      end

    standings
      .sort_by { |row| -row.total_points }
      .tap { |rows| assign_ranks(rows) }
  end

  private

  attr_reader :competitors, :result_records, :rounds

  def assign_ranks(standings)
    return standings unless standings.any?

    standings.first.rank = 1
    standings.each_cons(2).with_index do |(prev, curr), index|
      curr.rank = prev.total_points == curr.total_points ? prev.rank : index + 2
    end
  end

  def calculate_points
    rounds.each do |round|
      round_results = results.select { |result| round.includes?(result.round) }
      next if round_results.empty?

      best_result_record = round_results.max_by(&:result)
      best_result_record.best_result!

      round_results.each { |record| record.calculate_points_from(best_result_record.result) }
    end
  end

  def results
    @results ||= result_records.map { |record| Result.new(record) }
  end
end

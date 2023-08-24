class PerformanceCompetition::Scoreboard::Standings
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
      same_rank = prev.total_points == curr.total_points && curr.total_points&.positive?
      curr.rank = same_rank ? prev.rank : index + 2
    end
  end

  def calculate_points
    rounds.each do |round|
      round_results = results.select { |result| result.round == round }
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

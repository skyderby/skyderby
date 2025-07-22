class Boogie::Scoreboard::Standings
  attr_reader :competitors, :results, :rounds, :number_of_results_for_total, :previous_standings

  def initialize(competitors, rounds, results, number_of_results_for_total, previous_standings = nil)
    @competitors = competitors
    @rounds = rounds
    @results = results
    @number_of_results_for_total = number_of_results_for_total
    @previous_standings = previous_standings
  end

  def rows
    standings =
      competitors.map do |competitor|
        competitor_results = results.select { |result| result.competitor == competitor }
        Row.new(competitor, competitor_results, number_of_results_for_total)
      end

    standings
      .sort_by { |row| -row.total_points }
      .tap { |rows| assign_ranks(rows) }
  end

  def best_result = results.max_by(&:result)

  private

  def assign_ranks(standings)
    return standings unless standings.any?

    standings.first.rank = 1
    standings.each_cons(2).with_index do |(prev, curr), index|
      same_rank = prev.total_points == curr.total_points && curr.total_points&.positive?
      curr.rank = same_rank ? prev.rank : index + 2
    end
  end
end

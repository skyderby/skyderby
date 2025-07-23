class Boogie::Scoreboard::Standings::Row
  attr_accessor :rank
  attr_reader :competitor, :number_of_results_for_total, :results

  def initialize(competitor, results, number_of_results_for_total)
    @competitor = competitor
    @results = results
    @number_of_results_for_total = number_of_results_for_total
  end

  def total_points
    return 0 if best_results.empty?

    best_results.sum(&:result) / number_of_results_for_total
  end

  def best_result = best_results.first

  def best_results
    return [] if results.size < number_of_results_for_total

    results.sort_by(&:result).reverse.first(number_of_results_for_total)
  end

  def result_in_round(round) = results.find { |r| r.round == round}
end

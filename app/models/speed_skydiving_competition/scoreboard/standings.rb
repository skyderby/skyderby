class SpeedSkydivingCompetition::Scoreboard::Standings
  def self.build(...) = new(...).build

  def initialize(competitors, completed_rounds, results, previous_standings = [])
    @competitors = competitors
    @completed_rounds = completed_rounds
    @results = results
    @previous_standings = previous_standings.index_by { |row| row[:competitor] }
  end

  def build
    competitors
      .map { |competitor| build_row(competitor) }
      .sort_by { |row| -row[:total].to_f }
      .tap { |rows| assign_ranks(rows) }
      .tap { |rows| assign_previous_ranks(rows) }
  end

  private

  attr_reader :competitors, :completed_rounds, :results, :previous_standings

  def build_row(competitor)
    all_results = results.select { |result| result.competitor == competitor }
    accountable_results = accountable_results_for(competitor)
    final_results = accountable_results.filter_map(&:final_result)
    total = final_results.sum
    average = final_results.empty? ? 0 : total / final_results.length

    {
      competitor: competitor,
      total: total.round(2),
      average: average.round(2),
      best_result: (final_results.max if final_results.many?),
      worst_result: (final_results.min if final_results.many?),
      all_results:,
      accountable_results:
    }
  end

  def accountable_results_for(competitor)
    results.select do |result|
      result.competitor == competitor && completed_rounds.include?(result.round)
    end
  end

  def assign_ranks(standings)
    return standings unless standings.any?

    standings.first[:rank] = 1
    standings.each_cons(2).with_index do |(prev, curr), index|
      same_rank = prev[:total] == curr[:total] && curr[:total].positive?
      curr[:rank] = same_rank ? prev[:rank] : index + 2
    end
  end

  def assign_previous_ranks(standings)
    return unless previous_standings.any?

    standings.each do |row|
      row[:previous_rank] = previous_standings[row[:competitor]][:rank] || row[:rank]
    end
  end
end

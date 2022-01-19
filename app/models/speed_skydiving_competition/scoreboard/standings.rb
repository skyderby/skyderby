class SpeedSkydivingCompetition::Scoreboard::Standings
  def self.build(*args)
    new(*args).build
  end

  def initialize(competitors, completed_rounds, results)
    @competitors = competitors
    @completed_rounds = completed_rounds
    @results = results
  end

  def build
    standings = competitors.map do |competitor|
      competitor_results = accountable_results_for(competitor)
      total = competitor_results.sum { |record| record.final_result || 0.0 }
      average = completed_rounds.any? ? total / completed_rounds.size : 0

      {
        competitor: competitor,
        total: total.round(2),
        average: average.round(2),
        results: competitor_results
      }
    end

    standings
      .sort_by { |row| -row[:total].to_f }
      .tap { |rows| assign_ranks(rows) }
  end

  private

  attr_reader :competitors, :completed_rounds, :results

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
end

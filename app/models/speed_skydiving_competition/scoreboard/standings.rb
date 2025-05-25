class SpeedSkydivingCompetition::Scoreboard::Standings
  def self.build(...) = new(...).build

  def initialize(competitors, completed_rounds, results, previous_standings = [])
    @competitors = competitors
    @completed_rounds = completed_rounds
    @results = results
    @previous_standings = previous_standings.index_by { |row| row[:competitor] }
  end

  def build
    standings = competitors.map do |competitor|
      all_results = results.select { |result| result.competitor == competitor }
      accountable_results = accountable_results_for(competitor)
      total = accountable_results.sum { |record| record.final_result || 0.0 }
      average = completed_rounds.empty? ? 0 : total / completed_rounds.length

      {
        competitor: competitor,
        total: total.round(2),
        average: average.round(2),
        all_results:,
        accountable_results:
      }
    end

    standings
      .sort_by { |row| -row[:total].to_f }
      .tap { |rows| assign_ranks(rows) }
      .tap { |rows| assign_previous_ranks(rows) }
  end

  private

  attr_reader :competitors, :completed_rounds, :results, :previous_standings

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

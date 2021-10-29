class SpeedSkydivingCompetition::Scoreboard:: Standings
  def self.build(*args)
    new(*args).build
  end

  def initialize(competitors, rounds, results)
    @competitors = competitors
    @rounds = rounds
    @results = results
  end

  def build
    standings = competitors.map do |competitor|
      competitor_results = results.select { |result| result.competitor == competitor }
      total = competitor_results.sum { |record| record.result || 0.0 }
      average = competitor_results.any? ? total / competitor_results.size : 0

      { competitor: competitor, total: total.round(2), average: average.round(2) }
    end

    standings
      .sort_by { |row| -row[:total].to_f }
      .tap { |rows| assign_ranks(rows) }
  end

  private

  attr_reader :competitors, :rounds, :results

  def assign_ranks(standings)
    return standings unless standings.any?

    standings.first[:rank] = 1
    standings.each_cons(2).with_index do |(prev, curr), index|
      curr[:rank] = prev[:total] == curr[:total] ? prev[:rank] : index + 2
    end
  end
end

class PerformanceCompetitionSeries::Scoreboard::Standings::Row
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
        active_rounds = rounds.select(&:completed)
        next if active_rounds.count.zero?

        sum_of_points =
          active_rounds
          .filter_map { |round| result_in_round(round) }
          .sum { |result| result.points.to_f }

        memo[discipline] = sum_of_points.to_f / active_rounds.count
      end
  end

  def result_in_round(round)
    results.find { |result| round.includes?(result.round) }
  end

  private

  attr_reader :results, :rounds

  def rounds_by_discipline = rounds.group_by(&:discipline)
end

class PerformanceCompetition::Scoreboard::Standings::Row
  attr_accessor :rank
  attr_reader :competitor, :rounds, :results

  def initialize(competitor, results, rounds)
    @competitor = competitor
    @results = results
    @rounds = rounds
  end

  def total_points = points_in_disciplines.sum { |_discipline, points| points }.round(1)

  def points_in_disciplines
    @points_in_disciplines ||=
      rounds_by_discipline.each_with_object({}) do |(discipline, rounds), memo|
        results_in_discipline =
          rounds
          .map { |round| result_in_round(round) }
          .compact

        next unless results_in_discipline.any?

        memo[discipline] = results_in_discipline.sum { |result| result.points.to_f } / rounds.count
      end
  end

  def result_in_round(round) = results.find { |result| result.round == round }

  private

  def rounds_by_discipline = rounds.group_by(&:discipline)
end

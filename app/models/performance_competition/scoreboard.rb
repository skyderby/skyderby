class PerformanceCompetition::Scoreboard
  include PerformanceCompetition::TimeMachineable

  attr_reader :event, :until_round, :apply_penalty_to_score, :wind_cancellation

  # @param until_round [Integer, nil] 1-based position in the completion timeline to display up to
  def initialize(event, until_round: nil, wind_cancellation: false)
    @event = event
    @apply_penalty_to_score = event.apply_penalty_to_score
    @until_round = until_round
    @wind_cancellation = wind_cancellation
  end

  def columns_count
    @columns_count ||= rounds.count * 2 + (show_discipline_points? ? rounds_by_discipline.count : 0) + 4
  end

  def show_discipline_points? = rounds_by_discipline.size > 1

  def categories
    @categories ||=
      event
      .categories
      .includes(competitors: [:event, { profile: :country, suit: :manufacturer }])
      .ordered
      .index_with { |category| category_standings(category) }
  end

  def rounds = event.rounds.ordered

  def category_standings(category)
    category_competitors = category.competitors
    category_results = results.select { |result| category_competitors.include? result.competitor }
    previous_standings = Standings.new(
      category_competitors,
      completed_rounds[0...-1],
      category_results,
      apply_penalty_to_score:,
      wind_cancellation:
    )

    Standings.new(
      category_competitors,
      completed_rounds,
      category_results,
      previous_standings,
      apply_penalty_to_score:,
      wind_cancellation:
    )
  end

  def rounds_by_discipline
    @rounds_by_discipline ||= rounds.group_by(&:discipline)
  end

  def results
    @results ||= event.results.includes(:round, :competitor)
  end
end

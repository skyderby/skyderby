class PerformanceCompetition::Scoreboard
  attr_reader :event, :until_round, :apply_penalty_to_score, :wind_cancellation

  # @param until_round [Round, nil] the round until which the scoreboard should be displayed
  def initialize(event, until_round: nil, wind_cancellation: false)
    @event = event
    @apply_penalty_to_score = event.apply_penalty_to_score
    @until_round = until_round
    @wind_cancellation = wind_cancellation
  end

  def columns_count
    @columns_count ||= rounds.count * 2 + rounds_by_discipline.count + 4
  end

  def categories
    @categories ||=
      event
      .categories
      .includes(competitors: [:event, { profile: :country, suit: :manufacturer }])
      .ordered
      .index_with { |category| category_standings(category) }
  end

  def rounds = event.rounds.ordered

  def completed_rounds
    @completed_rounds ||= rounds.completed.then do |rounds|
      if until_round.nil?
        rounds
      else
        rounds.take_while { it != until_round }
      end
    end
  end

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

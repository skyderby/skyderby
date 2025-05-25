class SpeedSkydivingCompetition::Scoreboard
  attr_reader :event, :until_round

  def initialize(event, until_round: nil)
    @event = event
    @until_round = until_round
  end

  def categories
    @categories ||= event.categories.ordered.map { |record| category_standings(record) }
  end

  def rounds
    @rounds ||= event.rounds.ordered
  end

  def completed_rounds
    @completed_rounds ||=
      if until_round
        rounds.completed.where(number: ..until_round)
      else
        rounds.completed
      end
  end

  private

  def category_standings(category)
    category_competitors = competitors.select { |competitor| competitor.category == category }
    category_results = results.select { |result| category_competitors.include? result.competitor }
    previous_standings = Standings.build(category_competitors, completed_rounds[0...-1], category_results)
    standings = Standings.build(category_competitors, completed_rounds, category_results, previous_standings)

    { category:, standings: }
  end

  def competitors
    @competitors ||= event.competitors.includes(:category, profile: :country)
  end

  def results
    @results ||= event.results.includes(:round, :competitor, :penalties)
  end
end

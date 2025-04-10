class SpeedSkydivingCompetition::Scoreboard
  def initialize(event)
    @event = event
  end

  def categories
    @categories ||= event.categories.ordered.map { |record| category_standings(record) }
  end

  def rounds
    @rounds ||= event.rounds.ordered
  end

  def completed_rounds
    @completed_rounds ||= event.rounds.completed
  end

  private

  attr_reader :event

  def category_standings(category)
    category_competitors = competitors.select { |competitor| competitor.category == category }
    category_results = results.select { |result| category_competitors.include? result.competitor }

    {
      category:,
      standings: Standings.build(category_competitors, completed_rounds, category_results)
    }
  end

  def competitors
    @competitors ||= event.competitors.includes(:category, profile: :country)
  end

  def results
    @results ||= event.results.includes(:round, :competitor, :penalties)
  end
end

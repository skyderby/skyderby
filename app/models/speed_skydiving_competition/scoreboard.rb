class SpeedSkydivingCompetition::Scoreboard
  def initialize(event)
    @event = event
  end

  def categories
    @categories ||= event.categories.sorted.map { |record| category_standings(record) }
  end

  private

  attr_reader :event

  def category_standings(category)
    category_competitors = competitors.select { |competitor| competitor.category == category }
    category_results = results.select { |result| category_competitors.include? result.competitor }

    {
      category: category,
      standings: Standings.build(category_competitors, completed_rounds, category_results)
    }
  end

  def completed_rounds
    @completed_rounds ||= event.rounds.completed
  end

  def competitors
    @competitors ||= event.competitors.includes(:category)
  end

  def results
    @results ||= event.results.includes(:round, :competitor)
  end
end

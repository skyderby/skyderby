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
    {
      category: category,
      standings: event.competitors.filter { |competitor| competitor.category == category }
    }
  end
end

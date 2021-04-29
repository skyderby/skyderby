class PerformanceCompetition::Scoreboard
  def initialize(event, params)
    @event = event
    @settings = Settings.new(params)
  end

  def categories
    @categories ||=
      event.sections.map { |record| build_category(record) }
  end

  private

  attr_reader :event

  def build_category(category)
    category_competitors = competitors.select { |competitor| competitor.section == category }
    category_results = results.select { |result| category_competitors.include? result.competitor }

    standings = Standings.build(category_competitors, rounds, category_results)

    { category: category, standings: standings }
  end

  def rounds
    @rounds ||= event.rounds
  end

  def competitors
    @competitors ||= event.competitors.includes(:section)
  end

  def results
    @results ||= event.results.includes(:round, :competitor)
  end
end

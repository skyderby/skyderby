class PerformanceCompetition::Scoreboard
  attr_reader :event, :wind_cancelled

  def initialize(event, params)
    @event = event
    @wind_cancelled = params[:wind_cancelled]
  end

  def categories
    @categories ||= event.sections.ordered.map { |record| build_category(record) }
  end

  def rounds
    @rounds ||= event.rounds.ordered
  end

  def rounds_by_discipline
    @rounds_by_discipline ||= rounds.group_by(&:discipline)
  end

  private

  def build_category(category)
    category_competitors = competitors.select { |competitor| competitor.section == category }
    category_results = results.select { |result| category_competitors.include? result.competitor }

    standings = Standings.build(category_competitors, completed_rounds, category_results)

    { category:, standings: }
  end

  def completed_rounds
    @completed_rounds ||= rounds.select(&:completed?)
  end

  def competitors
    @competitors ||= event.competitors.includes(:section, profile: :country, suit: :manufacturer)
  end

  def results
    @results ||= event.results.includes(:round, :competitor)
  end
end

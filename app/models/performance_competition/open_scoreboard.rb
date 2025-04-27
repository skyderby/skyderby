class PerformanceCompetition::OpenScoreboard
  attr_reader :event, :wind_cancelled

  def initialize(event, params)
    @event = event
    @wind_cancelled = params[:wind_cancelled]
  end

  def rounds
    @rounds ||= event.rounds.ordered
  end

  def rounds_by_discipline
    @rounds_by_discipline ||= rounds.group_by(&:discipline)
  end

  def standings = PerformanceCompetition::Scoreboard::Standings.build(competitors, completed_rounds, results)

  private

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

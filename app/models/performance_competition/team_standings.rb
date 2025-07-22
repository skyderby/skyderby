class PerformanceCompetition::TeamStandings
  Row = Struct.new(:team, :ranks, :total_points)

  delegate :teams, to: :event

  def initialize(event, wind_cancellation: false)
    @event = event
    @personal_standings = event.open_standings(wind_cancellation:).standings
  end

  def ranking
    teams
      .map { |team| score_team(team) }
      .sort_by { |row| -row.total_points }
  end

  private

  attr_reader :event, :personal_standings

  def score_team(team)
    ranks = team.competitors.map do |competitor|
      personal_standings.rows.find { |row| row.competitor == competitor }
    end

    total_points = ranks.sum(&:total_points)

    Row.new(team, ranks, total_points)
  end
end

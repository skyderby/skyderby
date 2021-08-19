class Event::TeamStandings
  Row = Struct.new(:team, :total_points)

  delegate :teams, to: :event

  def initialize(event, personal_standings)
    @event = event
    @personal_standings = personal_standings
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
      competitors.find { |record| record.id == competitor.id }
    end

    total_points = ranks.sum(&:total_points)

    Row.new(team, total_points)
  end

  def competitors
    personal_standings
      .sections
      .map { |category| category.competitors.to_a }
      .flatten
  end
end

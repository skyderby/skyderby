class PerformanceCompetition::TeamStandings
  Row = Struct.new(:team, :ranks, :total_points, :rank)

  delegate :teams, to: :event

  def initialize(event, wind_cancellation: false)
    @event = event
    @personal_standings = event.open_standings(wind_cancellation:).standings
  end

  def ranking
    @ranking ||=
      teams
      .map { |team| score_team(team) }
      .sort_by { |row| -row.total_points }
      .tap { |rows| assign_ranks(rows) }
  end

  private

  attr_reader :event, :personal_standings

  def assign_ranks(rows)
    return rows unless rows.any?

    rows.first.rank = 1
    rows.each_cons(2).with_index do |(prev, curr), index|
      same_rank = prev.total_points == curr.total_points && curr.total_points.positive?
      curr.rank = same_rank ? prev.rank : index + 2
    end
  end

  def score_team(team)
    ranks = team.competitors.map do |competitor|
      personal_standings.rows.find { |row| row.competitor == competitor }
    end

    total_points = ranks.sum(&:total_points).round(1)

    Row.new(team, ranks, total_points)
  end
end

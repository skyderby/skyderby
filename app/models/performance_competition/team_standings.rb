class PerformanceCompetition::TeamStandings
  Row = Struct.new(:team, :ranks, :total_points, :rank)

  delegate :teams, to: :event
  delegate :until_round, :time_machine?, :timeline_rounds, :timeline_position, to: :open_scoreboard

  def initialize(event, until_round: nil, wind_cancellation: false)
    @event = event
    @open_scoreboard = event.open_standings(until_round:, wind_cancellation:)
    @personal_standings = open_scoreboard.standings
  end

  def ranking
    @ranking ||=
      teams
      .map { |team| score_team(team) }
      .sort_by { |row| -row.total_points }
      .tap { |rows| assign_ranks(rows) }
  end

  private

  attr_reader :event, :personal_standings, :open_scoreboard

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

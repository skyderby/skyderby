class PerformanceCompetition::TeamScoreboard
  def initialize(event)
    @event = event
  end

  def rows
    event
      .teams
      .map { |team| calculate_team_score(team) }
      .tap { |teams| assign_ranks(teams) }
  end

  private

  attr_reader :event

  def calculate_team_score(team)
    team_score = team_competitors(team).sum do |competitor|
      competitor_standing = standings.find { |row| row.competitor == competitor }
      competitor_standing&.total_points || 0
    end

    { team: team, score: team_score }
  end

  def assign_ranks(teams)
    return teams unless teams.any?

    teams.first[:rank] = 1
    teams.each_cons(2).with_index do |(prev, curr), index|
      curr[:rank] = prev[:total] == curr[:total] ? prev[:rank] : index + 2
    end
  end

  def standings
    @standings ||= PerformanceCompetition::Scoreboard::Standings.build(
      competitors,
      rounds,
      results
    )
  end

  def team_competitors(team)
    competitors.select { |competitor| competitor.team == team }
  end

  def competitors
    @competitors ||= event.competitors.includes(:section)
  end

  def rounds = event.rounds.ordered

  def results = event.results.includes(:round, :competitor)
end

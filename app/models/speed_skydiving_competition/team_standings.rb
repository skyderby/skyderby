class SpeedSkydivingCompetition::TeamStandings
  def initialize(event)
    @event = event
  end

  def rows
    teams
      .map { |team| { team_id: team.id, total: calculate_team_score(team) } }
      .sort_by { |row| -row[:total].to_f }
      .tap { |standings| assign_ranks(standings) }
  end

  private

  attr_reader :event

  def calculate_team_score(team)
    team_results = results.select { |record| team.competitors.include? record.competitor }
    return if team_results.blank?

    team_results
      .select { |record| record.result.present? }
      .sum(&:result)
      .round(2)
  end

  def assign_ranks(standings)
    return standings unless standings.any?

    standings.first[:rank] = 1
    standings.each_cons(2).with_index do |(prev, curr), index|
      curr[:rank] = prev[:total] == curr[:total] ? prev[:rank] : index + 2
    end
  end

  def teams
    @teams ||= event.teams.includes(:competitors)
  end

  def results
    @results ||= event.results.includes(:round, :competitor)
  end
end

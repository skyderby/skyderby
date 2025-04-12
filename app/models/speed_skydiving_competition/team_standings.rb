class SpeedSkydivingCompetition::TeamStandings
  def initialize(event)
    @event = event
  end

  def rows
    teams
      .map { |team| { team:, competitors: team.competitors, **calculate_team_score(team) } }
      .sort_by { |row| -row[:total].to_f }
      .tap { |standings| assign_ranks(standings) }
  end

  private

  attr_reader :event

  def calculate_team_score(team)
    team_results = accountable_team_results(team)
    return { scores_by_competitor: {}, total: nil } if team_results.blank?

    total = team_results.select { |record| record.final_result.present? }.sum(&:final_result).round(2)

    scores_by_competitor = team.competitors.each_with_object({}) do |competitor, scores|
      score = team_results.select { |result| result.competitor == competitor }.sum(&:final_result).round(2)
      percent = (score / total * 100).round(1)

      scores[competitor] = { score:, percent: }
    end

    { scores_by_competitor:, total: }
  end

  def accountable_team_results(team)
    results.select do |result|
      team.competitors.include?(result.competitor) && completed_rounds.include?(result.round)
    end
  end

  def assign_ranks(standings)
    return standings unless standings.any?

    standings.first[:rank] = 1
    standings.each_cons(2).with_index do |(prev, curr), index|
      same_rank = prev[:total] == curr[:total] && curr[:total]&.positive?
      curr[:rank] = same_rank ? prev[:rank] : index + 2
    end
  end

  def completed_rounds
    @completed_rounds = event.rounds.completed
  end

  def teams
    @teams ||= event.teams.includes(competitors: :profile)
  end

  def results
    @results ||= event.results.includes(:round, :competitor)
  end
end

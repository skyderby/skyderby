class PerformanceCompetition::TaskScoreboard
  include PerformanceCompetition::TimeMachineable

  attr_reader :event, :task, :until_round, :wind_cancellation

  def initialize(event, task, until_round: nil, wind_cancellation: false)
    @event = event
    @task = task
    @until_round = until_round
    @wind_cancellation = wind_cancellation
  end

  def columns_count
    @columns_count ||= rounds.count * 2 + 4
  end

  def show_discipline_points? = false

  def standings
    previous_standings = PerformanceCompetition::Scoreboard::Standings.new(
      event.competitors,
      completed_rounds[0...-1],
      results,
      wind_cancellation:
    )

    PerformanceCompetition::Scoreboard::Standings.new(
      event.competitors,
      completed_rounds,
      results,
      previous_standings,
      wind_cancellation:
    )
  end

  def rounds = event.rounds.where(discipline: task).ordered

  def rounds_by_discipline
    @rounds_by_discipline ||= rounds.group_by(&:discipline)
  end

  def results
    @results ||= event.results.includes(:round, :competitor)
  end
end

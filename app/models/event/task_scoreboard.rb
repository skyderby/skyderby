class Event::TaskScoreboard
  attr_reader :event, :task, :wind_cancellation

  def initialize(event, task, wind_cancellation: false)
    @event = event
    @task = task
    @wind_cancellation = wind_cancellation
  end

  def columns_count
    @columns_count ||= rounds.count * 2 + 4
  end

  def standings
    Event::Scoreboard::Standings.new(event.competitors, rounds, results, wind_cancellation:)
  end

  def rounds
    @rounds ||= event.rounds.where(discipline: task).order(:number, :created_at)
  end

  def rounds_by_discipline
    @rounds_by_discipline ||= rounds.group_by(&:discipline)
  end

  def results
    @results ||= event.results.includes(:round, :competitor)
  end
end

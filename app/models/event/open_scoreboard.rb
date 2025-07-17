class Event::OpenScoreboard
  attr_reader :event, :until_round, :wind_cancellation

  # @param until_round [Round, nil] the round until which the scoreboard should be displayed
  def initialize(event, until_round: nil, wind_cancellation: false)
    @event = event
    @until_round = until_round
    @wind_cancellation = wind_cancellation
  end

  def columns_count
    @columns_count ||= rounds.count * 2 + rounds_by_discipline.count + 4
  end

  def standings
    Event::Scoreboard::Standings.new(event.competitors, completed_rounds, results, wind_cancellation:)
  end

  def rounds = event.rounds.order(:number, :created_at)

  def completed_rounds
    @rounds ||= rounds.completed.then do |rounds|
      if until_round.nil?
        rounds
      else
        rounds.take_while { it != until_round }
      end
    end
  end

  def rounds_by_discipline
    @rounds_by_discipline ||= rounds.group_by(&:discipline)
  end

  def results
    @results ||= event.results.includes(:round, :competitor)
  end
end

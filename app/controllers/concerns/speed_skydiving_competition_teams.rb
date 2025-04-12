module SpeedSkydivingCompetitionTeams
  extend ActiveSupport::Concern

  def broadcast_teams_scoreboard
    Turbo::StreamsChannel.broadcast_replace_to @event, :teams, :editable,
                                               target: 'teams-scoreboard',
                                               partial: 'speed_skydiving_competitions/teams/scoreboard',
                                               locals: { event: @event, editable: !@event.finished? }

    if @event.surprise?
      Turbo::StreamsChannel.broadcast_replace_to @event, :teams, :read_only,
                                                 target: 'teams-scoreboard',
                                                 partial: 'speed_skydiving_competitions/surprise'
    else
      Turbo::StreamsChannel.broadcast_replace_to @event, :teams, :read_only,
                                                 target: 'teams-scoreboard',
                                                 partial: 'speed_skydiving_competitions/teams/scoreboard',
                                                 locals: { event: @event, editable: false }
    end
  end
end

module SpeedSkydivingCompetitionBroadcasts
  extend ActiveSupport::Concern

  def broadcast_scoreboard
    editable = !@event.finished?

    Turbo::StreamsChannel.broadcast_render_later_to(
      [@event, :scoreboard, :editable],
      template: 'speed_skydiving_competitions/broadcasts/scoreboard',
      locals: { event: @event, editable: }
    )
    Turbo::StreamsChannel.broadcast_render_later_to(
      [@event, :scoreboard, :read_only],
      template: 'speed_skydiving_competitions/broadcasts/scoreboard',
      locals: { event: @event, editable: false }
    )

    Turbo::StreamsChannel.broadcast_render_later_to(
      [@event, :open_scoreboard, :editable],
      template: 'speed_skydiving_competitions/broadcasts/open_scoreboard',
      locals: { event: @event, editable: }
    )
    Turbo::StreamsChannel.broadcast_render_later_to(
      [@event, :open_scoreboard, :read_only],
      template: 'speed_skydiving_competitions/broadcasts/open_scoreboard',
      locals: { event: @event, editable: false }
    )

    broadcast_teams_scoreboard
  end

  def broadcast_teams_scoreboard
    editable = !@event.finished?

    Turbo::StreamsChannel.broadcast_render_later_to(
      [@event, :teams, :editable],
      template: 'speed_skydiving_competitions/broadcasts/teams_scoreboard',
      locals: { event: @event, editable: }
    )
    Turbo::StreamsChannel.broadcast_render_later_to(
      [@event, :teams, :read_only],
      template: 'speed_skydiving_competitions/broadcasts/teams_scoreboard',
      locals: { event: @event, editable: false }
    )
  end

  def broadcast_actions_bar
    Turbo::StreamsChannel.broadcast_replace_to @event, :actions_bar, :editable,
                                               target: 'actions-bar',
                                               partial: 'speed_skydiving_competitions/actions_bar',
                                               locals: { event: @event, editable: true, standings: @event.standings }

    Turbo::StreamsChannel.broadcast_replace_to @event, :actions_bar, :read_only,
                                               target: 'actions-bar',
                                               partial: 'speed_skydiving_competitions/actions_bar',
                                               locals: { event: @event, editable: false, standings: @event.standings }
  end
end

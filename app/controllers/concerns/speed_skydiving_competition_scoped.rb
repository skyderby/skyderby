module SpeedSkydivingCompetitionScoped
  extend ActiveSupport::Concern

  def authorize_event_update!
    respond_not_authorized unless @event.editable?
  end

  def authorize_event_access!
    respond_not_authorized unless @event.viewable?
  end

  def authorize_event_create!
    respond_not_authorized unless SpeedSkydivingCompetition.creatable?
  end

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end

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
end

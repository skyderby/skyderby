module BoogieContext
  extend ActiveSupport::Concern

  def respond_with_scoreboard
    respond_to do |format|
      format.turbo_stream { render template: 'boogies/update_scoreboard' }
    end
  end

  def authorize_event_access!
    respond_not_authorized unless @event.viewable?
  end

  def authorize_event_update!
    respond_not_authorized unless @event.editable?
  end

  def set_event
    @event =
      Boogie
      .includes(organizers: [{ user: :profile }], sponsors: :sponsorable)
      .find(params[:boogie_id])
  end

  def broadcast_scoreboards
    Turbo::StreamsChannel.broadcast_replace_later_to(
      [@event, :scoreboard, :editable],
      target: 'scoreboard',
      partial: 'boogies/scoreboard',
      locals: { event: @event, editable: !@event.finished? }
    )

    Turbo::StreamsChannel.broadcast_replace_later_to(
      [@event, :scoreboard, :read_only],
      target: 'scoreboard',
      partial: 'boogies/scoreboard',
      locals: { event: @event, editable: false }
    )
  end
end

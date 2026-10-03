module BoogieContext
  extend ActiveSupport::Concern

  include BoogieScoreboardBroadcasts

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
end

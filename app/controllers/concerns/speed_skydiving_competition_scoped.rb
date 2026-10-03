module SpeedSkydivingCompetitionScoped
  extend ActiveSupport::Concern
  include SpeedSkydivingCompetitionBroadcasts

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
end

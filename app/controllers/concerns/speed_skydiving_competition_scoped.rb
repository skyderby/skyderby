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
    Turbo::StreamsChannel.broadcast_replace_to @event, :scoreboard, :editable,
                                               target: 'scoreboard',
                                               partial: 'speed_skydiving_competitions/scoreboard',
                                               locals: { event: @event, editable: !@event.finished? }

    if @event.surprise?
      Turbo::StreamsChannel.broadcast_replace_to @event, :scoreboard, :read_only,
                                                 target: 'scoreboard',
                                                 partial: 'speed_skydiving_competitions/surprise'
    else
      Turbo::StreamsChannel.broadcast_replace_to @event, :scoreboard, :read_only,
                                                 target: 'scoreboard',
                                                 partial: 'speed_skydiving_competitions/scoreboard',
                                                 locals: { event: @event, editable: false }
    end
  end
end

module PerformanceCompetitionScoped
  extend ActiveSupport::Concern

  included do
    before_action :set_event
    helper_method :display_event_params
  end

  def authorize_event_update!
    return if @event.editable?

    respond_not_authorized
  end

  def authorize_event_access!
    return if @event.viewable?

    respond_not_authorized
  end

  def set_event
    @event = PerformanceCompetition.find(params[:performance_competition_id])
  end

  def display_event_params
    params.permit(:display_raw_results, :omit_penalties, :split_by_categories)
  end

  def broadcast_scoreboard
    action_params = @event.wind_cancellation && !@standings.wind_cancelled ? { display_raw_results: true } : {}

    Turbo::StreamsChannel.broadcast_replace_to(
      @event, :scoreboard, :editable,
      target: 'scoreboard',
      partial: 'performance_competitions/scoreboard',
      locals: {
        event: @event,
        editable: !@event.finished?,
        standings: @event.standings,
        action_params:
      }
    )

    Turbo::StreamsChannel.broadcast_replace_to(
      @event, :scoreboard, :read_only,
      target: 'scoreboard',
      partial: 'performance_competitions/scoreboard',
      locals: {
        event: @event,
        editable: false,
        standings: @event.standings,
        action_params:
      }
    )

    Turbo::StreamsChannel.broadcast_replace_to(
      @event, :scoreboard, :editable, :wind_cancelled,
      target: 'scoreboard',
      partial: 'performance_competitions/scoreboard',
      locals: {
        event: @event,
        editable: !@event.finished?,
        standings: @event.standings(wind_cancelled: true),
        action_params:
      }
    )

    Turbo::StreamsChannel.broadcast_replace_to(
      @event, :scoreboard, :read_only, :wind_cancelled,
      target: 'scoreboard',
      partial: 'performance_competitions/scoreboard',
      locals: {
        event: @event,
        editable: false,
        standings: @event.standings(wind_cancelled: true),
        action_params:
      }
    )
  end
end

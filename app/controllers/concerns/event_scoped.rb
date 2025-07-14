module EventScoped
  extend ActiveSupport::Concern

  included do
    helper_method :display_event_params
  end

  def display_event_params
    params.permit(:display_raw_results, :omit_penalties, :split_by_categories)
  end

  def respond_with_scoreboard
    create_scoreboard(params[:event_id])
    respond_to do |format|
      format.js { render template: 'events/update_scoreboard' }
      format.turbo_stream { render template: 'events/update_scoreboard' }
    end
  end

  def create_scoreboard(event_id)
    load_event(event_id)
    @scoreboard = Events::Scoreboards.for(@event, scoreboard_params(@event))
  end

  def load_event(event_id)
    @event = Event.includes(
      organizers: [{ user: :profile }],
      sponsors: :sponsorable
    ).find(event_id)
  end

  def scoreboard_params(event)
    @scoreboard_params ||= Events::Scoreboards::Params.new(event, display_event_params)
  end

  def authorize_event
    return if EventPolicy.new(current_user, @event).update?

    raise Pundit::NotAuthorizedError
  end

  def authorize_event_access!
    respond_not_authorized unless EventPolicy.new(current_user, @event).show?
  end

  def set_event
    @event = Event.find(params[:event_id])
  end

  def broadcast_teams_scoreboard
    Turbo::StreamsChannel.broadcast_replace_to @event, :teams, :editable,
                                               target: 'teams-scoreboard',
                                               partial: 'performance_competitions/teams/scoreboard',
                                               locals: { event: @event, editable: !@event.finished? }

    if @event.surprise?
      Turbo::StreamsChannel.broadcast_replace_to @event, :teams, :read_only,
                                                 target: 'teams-scoreboard',
                                                 partial: 'events/surprise'
    else
      Turbo::StreamsChannel.broadcast_replace_to @event, :teams, :read_only,
                                                 target: 'teams-scoreboard',
                                                 partial: 'performance_competitions/teams/scoreboard',
                                                 locals: { event: @event, editable: false }
    end
  end
end

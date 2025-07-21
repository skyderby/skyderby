module EventScoped
  extend ActiveSupport::Concern

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
    display_event_params = params.permit(:wind_cancellation)
    @scoreboard_params ||= Events::Scoreboards::Params.new(event, display_event_params)
  end

  def authorize_event
    return if EventPolicy.new(current_user, @event).update?

    raise Pundit::NotAuthorizedError
  end

  def authorize_event_access!
    respond_not_authorized unless EventPolicy.new(current_user, @event).show?
  end

  def authorize_event_update!
    respond_not_authorized unless EventPolicy.new(current_user, @event).update?
  end

  def set_event
    @event = Event.find(params[:event_id])
  end

  def broadcast_validation_update_for(result)
    Turbo::StreamsChannel.broadcast_replace_later_to(
      [result.event, :validation],
      target: "lane-validation-competitor-#{result.id}",
      partial: 'performance_competitions/lane_validations/competitor',
      locals: { result: }
    )

    Turbo::StreamsChannel.broadcast_replace_later_to(
      [result.event, :validation],
      target: "toggle-validation-#{result.id}",
      partial: 'performance_competitions/lane_validations/toggle_validation',
      locals: { result: }
    )
  end

  def broadcast_scoreboards
    broadcast_open_scoreboard
    broadcast_task_scoreboards
  end

  def broadcast_open_scoreboard
    Turbo::StreamsChannel.broadcast_replace_later_to(
      [@event, :open_scoreboard, :editable],
      target: 'open_scoreboard',
      partial: 'performance_competitions/open_scoreboards/scoreboard',
      locals: { event: @event, editable: !@event.finished? }
    )

    Turbo::StreamsChannel.broadcast_replace_later_to(
      [@event, :open_scoreboard, :read_only],
      target: 'open_scoreboard',
      partial: 'performance_competitions/open_scoreboards/scoreboard',
      locals: { event: @event, editable: false }
    )
  end

  def broadcast_task_scoreboards
    @event.rounds.pluck(:discipline).uniq.each do |task|
      Turbo::StreamsChannel.broadcast_replace_later_to(
        [@event, :task_scoreboard, task, :editable],
        target: "#{task}_scoreboard",
        partial: 'performance_competitions/task_scoreboards/scoreboard',
        locals: { event: @event, task: task, editable: !@event.finished? }
      )

      Turbo::StreamsChannel.broadcast_replace_later_to(
        [@event, :task_scoreboard, task, :read_only],
        target: "#{task}_scoreboard",
        partial: 'performance_competitions/task_scoreboards/scoreboard',
        locals: { event: @event, task: task, editable: false }
      )
    end
  end

  def broadcast_teams_scoreboard
    Turbo::StreamsChannel.broadcast_replace_later_to(
      [@event, :teams, :editable],
      target: 'teams-scoreboard',
      partial: 'performance_competitions/teams/scoreboard',
      locals: { event: @event, editable: !@event.finished? }
    )

    Turbo::StreamsChannel.broadcast_replace_later_to(
      [@event, :teams, :read_only],
      target: 'teams-scoreboard',
      partial: 'performance_competitions/teams/scoreboard',
      locals: { event: @event, editable: false }
    )
  end
end

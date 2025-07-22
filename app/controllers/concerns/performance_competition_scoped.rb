module PerformanceCompetitionScoped
  extend ActiveSupport::Concern

  def respond_with_scoreboard
    respond_to do |format|
      format.turbo_stream { render template: 'performance_competitions/update_scoreboard' }
    end
  end

  def load_event(event_id)
    @event = PerformanceCompetition.includes(
      organizers: [{ user: :profile }],
      sponsors: :sponsorable
    ).find(event_id)
  end

  def scoreboard_params(event)
    display_event_params = params.permit(:wind_cancellation)
    @scoreboard_params ||= Events::Scoreboards::Params.new(event, display_event_params)
  end

  def authorize_event_access!
    respond_not_authorized unless @event.viewable?
  end

  def authorize_event_update!
    respond_not_authorized unless @event.editable?
  end

  def set_event
    @event = PerformanceCompetition.find(params[:performance_competition_id])
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
    broadcast_main_scoreboard
    broadcast_open_scoreboard
    broadcast_task_scoreboards

    if @event.wind_cancellation?
      broadcast_open_scoreboard(wind_cancellation: true)
      broadcast_task_scoreboards(wind_cancellation: true)
      broadcast_main_scoreboard(wind_cancellation: true)
    end
  end

  def broadcast_open_scoreboard(wind_cancellation: false)
    target = ['open_scoreboard', ('no_wind' if wind_cancellation)].compact.join('_')

    Turbo::StreamsChannel.broadcast_replace_later_to(
      [@event, :open_scoreboard, :editable],
      target:,
      partial: 'performance_competitions/open_scoreboards/scoreboard',
      locals: { event: @event, editable: !@event.finished?, wind_cancellation: }
    )

    Turbo::StreamsChannel.broadcast_replace_later_to(
      [@event, :open_scoreboard, :read_only],
      target:,
      partial: 'performance_competitions/open_scoreboards/scoreboard',
      locals: { event: @event, editable: false, wind_cancellation: }
    )
  end

  def broadcast_task_scoreboards(wind_cancellation: false)
    @event.rounds.pluck(:discipline).uniq.each do |task|
      target = [task, 'scoreboard', ('no_wind' if wind_cancellation)].compact.join('_')

      Turbo::StreamsChannel.broadcast_replace_later_to(
        [@event, :task_scoreboard, task, :editable],
        target:,
        partial: 'performance_competitions/task_scoreboards/scoreboard',
        locals: { event: @event, task: task, editable: !@event.finished?, wind_cancellation: }
      )

      Turbo::StreamsChannel.broadcast_replace_later_to(
        [@event, :task_scoreboard, task, :read_only],
        target:,
        partial: 'performance_competitions/task_scoreboards/scoreboard',
        locals: { event: @event, task: task, editable: false, wind_cancellation: }
      )
    end
  end

  def broadcast_main_scoreboard(wind_cancellation: false)
    target = ['scoreboard', ('no_wind' if wind_cancellation)].compact.join('_')

    Turbo::StreamsChannel.broadcast_replace_later_to(
      [@event, :scoreboard, :editable],
      target:,
      partial: 'performance_competitions/scoreboard',
      locals: { event: @event, editable: !@event.finished?, wind_cancellation: }
    )

    Turbo::StreamsChannel.broadcast_replace_later_to(
      [@event, :scoreboard, :read_only],
      target:,
      partial: 'performance_competitions/scoreboard',
      locals: { event: @event, editable: false, wind_cancellation: }
    )
  end

  def broadcast_teams_scoreboard
    wind_cancellation_values = [false]
    wind_cancellation_values << true if @event.wind_cancellation?

    wind_cancellation_values.each do |wind_cancellation|
      target = ['teams-scoreboard', ('no_wind' if wind_cancellation)].compact.join('_')

      Turbo::StreamsChannel.broadcast_replace_later_to(
        [@event, :teams, :editable],
        target:,
        partial: 'performance_competitions/teams/scoreboard',
        locals: { event: @event, editable: !@event.finished?, wind_cancellation: }
      )

      Turbo::StreamsChannel.broadcast_replace_later_to(
        [@event, :teams, :read_only],
        target:,
        partial: 'performance_competitions/teams/scoreboard',
        locals: { event: @event, editable: false, wind_cancellation: }
      )
    end
  end
end

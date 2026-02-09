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
    locals = { event: @event, wind_cancellation: }

    Turbo::StreamsChannel.broadcast_render_later_to(
      [@event, :open_scoreboard, :editable],
      template: 'performance_competitions/broadcasts/open_scoreboard',
      locals: locals.merge(editable: !@event.finished?)
    )

    Turbo::StreamsChannel.broadcast_render_later_to(
      [@event, :open_scoreboard, :read_only],
      template: 'performance_competitions/broadcasts/open_scoreboard',
      locals: locals.merge(editable: false)
    )
  end

  def broadcast_task_scoreboards(wind_cancellation: false)
    @event.rounds.pluck(:discipline).uniq.each do |task|
      locals = { event: @event, task:, wind_cancellation: }

      Turbo::StreamsChannel.broadcast_render_later_to(
        [@event, :task_scoreboard, task, :editable],
        template: 'performance_competitions/broadcasts/task_scoreboard',
        locals: locals.merge(editable: !@event.finished?)
      )

      Turbo::StreamsChannel.broadcast_render_later_to(
        [@event, :task_scoreboard, task, :read_only],
        template: 'performance_competitions/broadcasts/task_scoreboard',
        locals: locals.merge(editable: false)
      )
    end
  end

  def broadcast_main_scoreboard(wind_cancellation: false)
    locals = { event: @event, wind_cancellation: }

    Turbo::StreamsChannel.broadcast_render_later_to(
      [@event, :scoreboard, :editable],
      template: 'performance_competitions/broadcasts/main_scoreboard',
      locals: locals.merge(editable: !@event.finished?)
    )

    Turbo::StreamsChannel.broadcast_render_later_to(
      [@event, :scoreboard, :read_only],
      template: 'performance_competitions/broadcasts/main_scoreboard',
      locals: locals.merge(editable: false)
    )
  end

  def broadcast_teams_scoreboard
    wind_cancellation_values = [false]
    wind_cancellation_values << true if @event.wind_cancellation?

    wind_cancellation_values.each do |wind_cancellation|
      locals = { event: @event, wind_cancellation: }

      Turbo::StreamsChannel.broadcast_render_later_to(
        [@event, :teams, :editable],
        template: 'performance_competitions/broadcasts/teams_scoreboard',
        locals: locals.merge(editable: !@event.finished?)
      )

      Turbo::StreamsChannel.broadcast_render_later_to(
        [@event, :teams, :read_only],
        template: 'performance_competitions/broadcasts/teams_scoreboard',
        locals: locals.merge(editable: false)
      )
    end
  end
end

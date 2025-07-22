class PerformanceCompetitionsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event, except: %i[new create]
  before_action :authorize_event_access!, except: %i[new create]

  def new
    respond_not_authorized unless PerformanceCompetition.creatable?
    @event = PerformanceCompetition.new
  end

  def create
    respond_not_authorized unless PerformanceCompetition.creatable?

    @event = PerformanceCompetition.new event_params
    @event.responsible = current_user
    if @event.save
      redirect_to @event
    else
      redirect_to events_path
    end
  end

  def show
    @wind_cancellation = @event.wind_cancellation && params[:including_wind] != '1'
  end

  def edit
    respond_not_authorized unless @event.editable?
  end

  def update
    respond_not_authorized unless @event.editable?

    if @event.update event_params
      if @event.saved_change_to_status?
        broadcast_scoreboards
        broadcast_teams_scoreboard
      end

      redirect_to performance_competition_path(@event)
    else
      respond_with_errors(@event.errors)
    end
  end

  private

  def set_event
    @event = PerformanceCompetition.find(params[:id])
  end

  def event_params
    params.require(:performance_competition).permit(
      :name,
      :starts_at,
      :place_id,
      :range_from,
      :range_to,
      :status,
      :wind_cancellation,
      :visibility,
      :use_teams
    )
  end
end

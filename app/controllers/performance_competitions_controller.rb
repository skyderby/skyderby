class PerformanceCompetitionsController < ApplicationController
  include EventScoped, PerformanceCompetitionScoped

  before_action :set_event, only: %i[show edit update]

  before_action :authorize_event_create!, only: %i[new create]
  before_action :authorize_event_update!, except: %i[show new create]
  before_action :authorize_event_access!, only: %i[show]

  etag { display_event_params if action_name == 'show' }

  def new
    @event = PerformanceCompetition.new
  end

  def create
    @event = PerformanceCompetition.speed_distance_time.new event_params
    @event.responsible = current_user
    if @event.save
      redirect_to @event
    else
      redirect_to new_performance_competition_path
    end
  end

  def edit; end

  def update
    if @event.update event_params
      redirect_to performance_competition_path(@event)
    else
      respond_with_errors(@event.errors)
    end
  end

  def show
    @standings = @event.standings(wind_cancelled: @event.wind_cancellation && !params[:display_raw_results])
    @scoreboard = Events::Scoreboards.for(@event, scoreboard_params(@event))

    fresh_when @event
  end

  private

  def set_event
    @event = PerformanceCompetition.find(params[:id])
  end

  def event_params
    params.require(:event).permit(
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

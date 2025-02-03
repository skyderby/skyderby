class PerformanceCompetitionsController < ApplicationController
  include EventScoped, PerformanceCompetitionScoped

  before_action :set_event, only: %i[edit update destroy]
  etag { display_event_params if action_name == 'show' }

  def new
    authorize PerformanceCompetition
    @event = PerformanceCompetition.new
  end

  def create
    authorize PerformanceCompetition

    @event = PerformanceCompetition.speed_distance_time.new event_params
    @event.responsible = current_user
    if @event.save
      redirect_to @event
    else
      redirect_to new_performance_competition_path
    end
  end

  def edit
    authorize @event
  end

  def update
    authorize @event

    if @event.update update_event_params
      redirect_to performance_competition_path(@event)
    else
      respond_with_errors(@event.errors)
    end
  end

  def show
    load_event(params[:id])

    authorize @event

    @standings = @event.standings(wind_cancelled: @event.wind_cancellation && !params[:display_raw_results])
    @scoreboard = Events::Scoreboards.for(@event, scoreboard_params(@event))

    fresh_when @event
  end

  def destroy
    authorize @event
  end

  private

  def set_event
    @event = PerformanceCompetition.find(params[:id])
  end

  def event_params
    params.require(:event).permit(
      :name,
      :starts_at,
      :rules,
      :place_id,
      :range_from,
      :range_to,
      :status,
      :wind_cancellation,
      :visibility,
      :number_of_results_for_total,
      :use_teams
    )
  end

  def update_event_params
    event_params.tap do |all_params|
      all_params.delete(:rules) if @event.rounds.any?
    end
  end
end

class Api::V1::PerformanceCompetitions::TeamsController < Api::ApplicationController
  before_action :set_event

  def index
    authorize @event, :show?

    @teams = @event.teams.includes(:competitors)
  end

  def create
    authorize @event, :update?

    @team = @event.teams.new(team_params)

    if @team.save
      render
    else
      respond_with_errors @team.errors
    end
  end

  def update
    authorize @event, :update?

    @team = @event.teams.find(params[:id])

    if @team.update(team_params)
      render
    else
      respond_with_errors @team.errors
    end
  end

  def destroy
    authorize @event, :update?

    @team = @event.teams.find(params[:id])

    if @team.destroy
      render
    else
      respond_with_errors @team.errors
    end
  end

  private

  def set_event
    @event = Event.speed_distance_time.find(params[:performance_competition_id])
  end

  def team_params
    params.require(:team).permit(:name, competitor_ids: [])
  end
end

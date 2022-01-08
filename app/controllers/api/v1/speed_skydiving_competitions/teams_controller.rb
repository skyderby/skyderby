class Api::V1::SpeedSkydivingCompetitions::TeamsController < Api::ApplicationController
  before_action :set_event

  def index
    authorize @event, :show?

    @teams = @event.teams.includes(:competitors)
  end

  def create
    authorize @event, :update?

    @team = @event.teams.new(team_params)

    respond_to do |format|
      if @team.save
        format.json
      else
        format.json { respond_with_errors @team.errors }
      end
    end
  end

  def update
    authorize @event, :update?

    @team = @event.teams.find(params[:id])

    respond_to do |format|
      if @team.update(team_params)
        format.json
      else
        format.json { respond_with_errors @team.errors }
      end
    end
  end

  def destroy
    authorize @event, :update?

    @team = @event.teams.find(params[:id])

    respond_to do |format|
      if @team.destroy
        format.json
      else
        format.json { respond_with_errors @team.errors }
      end
    end
  end

  private

  def set_event
    @event = SpeedSkydivingCompetition.find(params[:speed_skydiving_competition_id])
  end

  def team_params
    params.require(:team).permit(:name, competitor_ids: [])
  end
end

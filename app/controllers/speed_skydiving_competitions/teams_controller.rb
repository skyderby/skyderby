class SpeedSkydivingCompetitions::TeamsController < ApplicationController
  include SpeedSkydivingCompetitionScoped
  include SpeedSkydivingCompetitionTeams

  before_action :set_event
  before_action :set_team, only: %i[edit update destroy]
  before_action :authorize_event_access!, only: :index
  before_action :authorize_event_update!, except: :index

  def index; end

  def new
    @team = @event.teams.new
  end

  def create
    @team = @event.teams.new(team_params)

    if @team.save
      broadcast_teams_scoreboard
    else
      respond_with_errors @team
    end
  end

  def edit; end

  def update
    if @team.update(team_params)
      broadcast_teams_scoreboard
    else
      respond_with_errors @team
    end
  end

  def destroy
    if @team.destroy
      broadcast_teams_scoreboard
    else
      respond_with_errors @team
    end
  end

  private

  def set_team
    @team = @event.teams.find(params[:id])
  end

  def team_params
    params.require(:team).permit(:name)
  end
end

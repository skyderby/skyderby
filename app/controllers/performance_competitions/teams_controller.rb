class PerformanceCompetitions::TeamsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :set_team, only: %i[edit update destroy]
  before_action :authorize_event_update!, except: :index
  before_action :authorize_event_access!, only: :index

  def index
    @wind_cancellation = @event.wind_cancellation && params[:including_wind] != '1'
  end

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

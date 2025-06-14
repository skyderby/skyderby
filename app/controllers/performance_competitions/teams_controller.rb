class PerformanceCompetitions::TeamsController < ApplicationController
  include EventScoped

  before_action :set_event
  before_action :set_team, only: %i[edit update destroy]
  before_action :authorize_event, except: :index

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

  def broadcast_teams_scoreboard
    Turbo::StreamsChannel.broadcast_replace_to @event, :teams, :editable,
                                               target: 'teams-scoreboard',
                                               partial: 'performance_competitions/teams/scoreboard',
                                               locals: { event: @event, editable: !@event.finished? }

    if @event.surprise?
      Turbo::StreamsChannel.broadcast_replace_to @event, :teams, :read_only,
                                                 target: 'teams-scoreboard',
                                                 partial: 'events/surprise'
    else
      Turbo::StreamsChannel.broadcast_replace_to @event, :teams, :read_only,
                                                 target: 'teams-scoreboard',
                                                 partial: 'performance_competitions/teams/scoreboard',
                                                 locals: { event: @event, editable: false }
    end
  end
end

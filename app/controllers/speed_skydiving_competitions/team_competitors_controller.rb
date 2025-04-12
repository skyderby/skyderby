class SpeedSkydivingCompetitions::TeamCompetitorsController < ApplicationController
  include SpeedSkydivingCompetitionScoped
  include SpeedSkydivingCompetitionTeams

  before_action :set_event
  before_action :authorize_event_update!

  def new
    @teams = @event.teams.ordered
    @competitors = @event.competitors.ordered
  end

  def create
    competitor = @event.competitors.find(params[:competitor_id])

    if competitor.update(team_id: params[:team_id])
      broadcast_teams_scoreboard
    else
      respond_with_errors(competitor)
    end
  end

  def destroy
    competitor = @event.competitors.find(params[:id])
    if competitor.update(team_id: nil)
      broadcast_teams_scoreboard
    else
      respond_with_errors(competitor)
    end
  end
end

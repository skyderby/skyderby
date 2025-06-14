class PerformanceCompetitions::TeamCompetitorsController < ApplicationController
  include EventScoped

  before_action :set_event
  before_action :authorize_event

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

  private

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
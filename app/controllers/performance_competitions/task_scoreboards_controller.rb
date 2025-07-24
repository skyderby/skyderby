class PerformanceCompetitions::TaskScoreboardsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_access!

  def index
    first_round = @event.rounds.ordered.first

    redirect_to performance_competition_task_scoreboard_path(@event, first_round.discipline) if first_round
  end

  def show
    @tasks = @event.rounds.group_by(&:discipline).keys
    @task = params[:id]
    @wind_cancellation = @event.wind_cancellation && params[:including_wind] != '1'

    redirect_to performance_competition_task_scoreboards_path if @tasks.exclude? @task
  end
end

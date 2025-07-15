class PerformanceCompetitions::TaskScoreboardsController < ApplicationController
  include EventScoped

  before_action :set_event
  before_action :authorize_event_access!

  def index
    first_round = @event.rounds.order(:number, :created_at).first

    redirect_to event_task_scoreboard_path(@event, first_round.discipline) if first_round
  end

  def show
    @tasks = @event.rounds.group_by(&:discipline).keys
    @task = params[:id]

    redirect_to event_task_scoreboards_path if @tasks.exclude? @task
  end
end

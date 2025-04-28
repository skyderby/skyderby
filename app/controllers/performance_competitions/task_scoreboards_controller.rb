class PerformanceCompetitions::TaskScoreboardsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event
  before_action :authorize_event_access!

  def show
    @scoreboard = @event.task_scoreboard(params[:task])
  end

  def index
    task = @event.rounds.first&.discipline || :distance
    redirect_to performance_competition_task_scoreboard_path(@event, task)
  end
end

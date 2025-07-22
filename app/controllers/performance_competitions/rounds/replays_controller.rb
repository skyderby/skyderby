class PerformanceCompetitions::Rounds::ReplaysController < ApplicationController
  before_action :set_event, :set_round

  def show
    allowed_to_view = @event.editable? || @round.completed

    redirect_to performance_competition_path(@event) unless allowed_to_view

    respond_to do |format|
      format.html
      format.js
      format.json
    end
  end

  private

  def set_round
    @round = @event.rounds.find(params[:round_id])
  end

  def set_event
    @event = PerformanceCompetition.find(params[:performance_competition_id])
  end
end

class PerformanceCompetitions::Rounds::MapsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_event, :set_round
  before_action :authorize_event_access!

  def show
    allowed_to_view = @event.editable? || @round.completed

    return redirect_to performance_competition_path(@event) unless allowed_to_view

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
end

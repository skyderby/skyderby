class PerformanceCompetitions::Rounds::MapsController < ApplicationController
  include PerformanceCompetitionScoped

  before_action :set_round, :authorize_event_access!

  def show
    allowed_to_view = policy(@event).edit? || @round.completed

    return redirect_to event_path(@event) unless allowed_to_view

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

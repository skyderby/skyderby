class PerformanceCompetitions::Rounds::GlobeController < ApplicationController
  before_action :load_event, :set_round

  def show
    @round_map = Events::Rounds::Globe.new(@round)

    allowed_to_view = @event.editable? || @round.completed
    return redirect_to performance_competition_path(@event) unless allowed_to_view

    respond_to do |format|
      format.html
      format.turbo_stream
      format.json
    end
  end

  private

  def set_round
    @round = @event.rounds.includes(results: [:track, { competitor: :profile }])
                   .find(params[:round_id])
  end

  def load_event
    @event =
      PerformanceCompetition
      .includes(categories: { competitors: :profile })
      .find(params[:performance_competition_id])
  end
end

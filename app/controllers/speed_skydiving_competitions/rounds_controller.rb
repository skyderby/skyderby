class SpeedSkydivingCompetitions::RoundsController < ApplicationController
  include SpeedSkydivingCompetitionScoped

  before_action :set_round, only: %i[update destroy]

  def create
    @round = @event.rounds.new
    if @round.save
      broadcast_scoreboard
    else
      respond_with_errors(@round)
    end
  end

  def update
    if @round.update(round_params)
      broadcast_scoreboard
    else
      respond_with_errors(@round)
    end
  end

  def destroy
    if @round.destroy
      broadcast_scoreboard
    else
      respond_with_errors(@round)
    end
  end

  private

  def round_params = params.require(:round).permit(:completed)

  def set_round
    @round = @event.rounds.find(params[:id])
  end
end

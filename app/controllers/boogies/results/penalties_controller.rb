class Boogies::Results::PenaltiesController < ApplicationController
  include EventTrackScoped, BoogieContext

  def show; end

  def update
    if @result.update(penalty_params)
      respond_with_scoreboard
      broadcast_scoreboards
    else
      respond_with_errors @result
    end
  end

  private

  def penalty_params
    params.require(:penalty).permit(:penalized, :penalty_size, :penalty_reason)
  end
end

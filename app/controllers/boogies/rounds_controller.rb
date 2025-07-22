class Boogies::RoundsController < ApplicationController
  include BoogieContext

  before_action :set_event
  before_action :set_round, only: %i[destroy]
  before_action :authorize_event_update!

  def create
    @round = @event.rounds.new(discipline: :distance)

    if @round.save
      respond_with_scoreboard
      broadcast_scoreboards
    else
      respond_with_errors @round
    end
  end

  def destroy
    if @round.destroy
      respond_with_scoreboard
      broadcast_scoreboards
    else
      respond_with_errors @round
    end
  end

  private

  def set_round
    @round = @event.rounds.find(params[:id])
  end
end

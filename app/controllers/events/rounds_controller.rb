# encoding: utf-8
class Events::RoundsController < ApplicationController
  include EventLoading

  before_action :set_round, only: :destroy

  load_resource :event
  before_filter :authorize_event

  load_and_authorize_resource :round, through: :event

  def create
    @round = @event.rounds.new round_params

    if @round.save
      respond_to do |format|
        format.json
        format.js { respond_with_scoreboard }
      end
    else
      respond_with_errors(@round.errors)
    end
  end

  def destroy
    if @round.destroy
      respond_to do |format|
        format.json { head :no_content }
        format.js { respond_with_scoreboard }
      end
    else
      respond_with_errors(@round.errors)
    end
  end

  private

  def set_round
    @round = Round.find(params[:id])
  end

  def round_params
    params.require(:round).permit(:name, :discipline, :event_id)
  end

  def authorize_event
    authorize! :update, @event
  end
end

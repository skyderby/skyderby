# encoding: utf-8
class RoundsController < ApplicationController
  before_action :set_round, only: [:update, :destroy]

  load_resource :event
  before_filter :authorize_event

  load_and_authorize_resource :round, through: :event

  def create
    @round = Round.new round_params

    if @round.save
      @round
    else
      render json: @round.errors, status: :unprocessable_entity
    end
  end

  def update
    if @round.update round_params
      @round
    else
      render json: @round.errors, status: :unprocessable_entity
    end
  end

  def destroy
    if @round.destroy
      head :no_content
    else
      render json: @round.errors, status: :unprocessable_entity
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

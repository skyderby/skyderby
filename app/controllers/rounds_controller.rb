# encoding: utf-8
class RoundsController < ApplicationController
  before_action :set_round, only: [:update, :destroy, :map_data]

  load_resource :event
  before_filter :authorize_event

  load_and_authorize_resource :round, through: :event

  def create
    @round = @event.rounds.new round_params

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

  def map_data
    map_data = Skyderby::Competitions::RoundMapData.new.execute(@round)
    render json: map_data
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

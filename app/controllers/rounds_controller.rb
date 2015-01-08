# encoding: utf-8
class RoundsController < ApplicationController
  def create
    @round = Round.new name: round_params[:name],
                       discipline_id: round_params[:discipline],
                       event_id: params[:event_id]

    if @round.save
      redirect_to event, notice: 'Round was successfully created.'
    else
      render action: 'new'
    end
  end

  private

  def round_params
    params[:round].permit(:name, :discipline)
  end
end

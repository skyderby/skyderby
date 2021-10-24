class SpeedSkydivingCompetitionsController < ApplicationController
  def show
    @event = SpeedSkydivingCompetition.find(params[:id])

    respond_to do |format|
      format.html
    end
  end
end

class Api::V1::Places::StatsController < Api::ApplicationController
  def show
    @place = Place.find(params[:place_id])
    authorize @place, :show?
  end
end

class Api::Web::Places::StatsController < Api::Web::ApplicationController
  def show
    @place = Place.find(params[:place_id])
    authorize @place, :show?
  end
end

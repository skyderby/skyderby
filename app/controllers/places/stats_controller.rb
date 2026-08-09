class Places::StatsController < Api::ApplicationController
  def show
    @place = Place.find(params[:place_id])
  end
end

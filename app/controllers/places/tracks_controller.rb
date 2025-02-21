class Places::TracksController < ApplicationController
  def index
    @place = Place.find(params[:place_id])
    authorize @place, :show?

    @tracks =
      @place
      .tracks
      .accessible
      .then { |tracks| TrackFilter.new(index_params).apply(tracks) }
      .then { |tracks| TrackOrder.new(index_params[:order]).apply(tracks) }
      .includes(:distance, :time, :speed, :video, pilot: :contributions, suit: :manufacturer)
      .paginate(page:, per_page: 25)
  end

  private

  def index_params
    params.permit(:order, :page, :kind, :profile_id, :profile_name, :suit_id, :place_id, :term)
  end
  helper_method :index_params
end

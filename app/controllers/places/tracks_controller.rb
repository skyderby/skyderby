class Places::TracksController < ApplicationController
  def index
    @place = Place.find(params[:place_id])
    authorize @place, :show?

    @tracks =
      @place
      .tracks
      .accessible
      .then { |tracks| TrackFilter.new(index_params).apply(tracks) }
      .sorted(index_params[:order])
      .includes(:distance, :time, :speed, :video, pilot: :contributions, suit: :manufacturer)
      .paginate(page:, per_page: 25)
  end

  private

  def index_params
    params.permit(:order, :page, :kind, :profile_id, :suit_id, :term)
  end
  helper_method :index_params
end

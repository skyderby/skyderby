class Profiles::TracksController < ApplicationController
  def index
    @profile = Profile.find(params[:profile_id])
    @tracks =
      @profile
      .tracks
      .accessible
      .includes(:distance, :speed, :time, :video, suit: :manufacturer, place: :country)
      .then { |tracks| TrackFilter.new(index_params).apply(tracks) }
      .then { |tracks| TrackOrder.new(index_params[:order]).apply(tracks) }
      .paginate(page:, per_page: 25)
  end

  private

  def index_params
    params.permit(:order, :page, :kind, :profile_id, :profile_name, :suit_id, :place_id, :term)
  end
  helper_method :index_params
end

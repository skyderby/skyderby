class PlacesController < ApplicationController
  before_action :set_place, only: [:show, :edit, :update]

  load_and_authorize_resource

  respond_to :json, :html

  def index
    tracks_query = Track
                   .accessible_by(current_user)
                   .select(:place_id,
                           'COUNT(tracks.id) tracks_count',
                           'COUNT(tracks.user_profile_id) pilots_count')
                   .group(:place_id)
                   .to_sql

    @places = Place
              .joins(:country)
              .joins('LEFT JOIN (' + tracks_query + ') tracks_count
                       ON tracks_count.place_id = places.id')
              .select(:id,
                      :name,
                      :latitude,
                      :longitude,
                      :msl,
                      :country_id,
                      'countries.name country_name',
                      'tracks_count.tracks_count',
                      'tracks_count.pilots_count')
              .order('country_name, places.name')

    if params[:query]
      @places = @places.search(params[:query][:term]) if params[:query][:term]
    end

    respond_with @places
  end

  def show
  end

  def edit
  end

  def new
    @place = Place.new
  end

  def create
    @place = Place.new place_params
    if @place.save
      redirect_to places_path
    else
      render action: 'new'
    end
  end

  def update
    if @place.update place_params
      redirect_to places_path
    else
      render action: 'edit'
    end
  end

  def destroy
    @place.destroy
    redirect_to places_path
  end

  private

  def set_place
    @place = Place.find(params[:id])
  end

  def place_params
    params.require(:place).permit(
      :name,
      :country_id,
      :latitude,
      :longitude,
      :msl,
      :information
    )
  end
end

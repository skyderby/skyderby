class PlacesController < ApplicationController
  before_action :set_place, only: [:show, :edit, :update]

  load_and_authorize_resource

  respond_to :json, :html

  def index
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
    respond_to do |format|
      format.json
      format.html do
        @tracks =
          Track
          .where(place: @place)
          .accessible_by(current_user)
          .order(recorded_at: :desc)
          .includes(
            :pilot,
            :distance,
            :time,
            :speed,
            :video,
            suit: :manufacturer
          ).paginate(page: params[:page], per_page: 50)
      end
    end
  end

  def edit; end

  def new
    @place = Place.new
  end

  def create
    @place = Place.new place_params
    respond_to do |format|
      if @place.save
        format.html { redirect_to places_path }
        format.json { @place }
      else
        format.html { render action: 'new' }
        format.json { render json: @place.errors, status: :unprocessible_entry }
      end
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
      :kind,
      exit_measurements_attributes: {}
    )
  end

  def tracks_query
    Track.accessible_by(current_user)
         .select(:place_id,
                 'COUNT(tracks.id) tracks_count',
                 'COUNT(DISTINCT tracks.profile_id) pilots_count')
         .group(:place_id)
         .to_sql
  end
end

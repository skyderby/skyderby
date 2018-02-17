class PlacesController < ApplicationController
  before_action :set_place, only: [:show, :edit, :update, :destroy]

  def index
    authorize Place

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
  end

  def show
    authorize @place

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

  def edit
    authorize @place
  end

  def new
    authorize :place

    @place = Place.new
  end

  def create
    authorize :place

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
    authorize @place

    if @place.update place_params
      redirect_to places_path
    else
      render action: 'edit'
    end
  end

  def destroy
    authorize @place

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

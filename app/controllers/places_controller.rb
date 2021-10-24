class PlacesController < ApplicationController
  before_action :set_place, only: [:show, :edit, :update, :destroy]

  def index
    authorize Place

    @places = Place.includes(:country)
                   .order('countries.name, places.name')
                   .group_by(&:country)

    respond_to do |format|
      format.html
      format.json
    end
  end

  def show
    authorize @place

    respond_to do |format|
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
      format.json
    end
  end

  def edit
    authorize @place

    respond_to do |format|
      format.html
    end
  end

  def new
    authorize :place

    @place = Place.new

    respond_to do |format|
      format.html
    end
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
      redirect_to @place
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
    params.require(:place).permit \
      :name,
      :country_id,
      :latitude,
      :longitude,
      :msl,
      :kind
  end
end

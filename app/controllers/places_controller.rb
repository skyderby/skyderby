class PlacesController < ApplicationController
  before_action :set_place, only: [:show, :edit, :update, :destroy]
  before_action :set_places, only: %i[index edit new]

  def index; end

  def show; end

  def edit
    respond_not_authorized unless @place.editable?
  end

  def new
    unless Place.creatable?
      respond_not_authorized
      return
    end

    @place = Place.new
  end

  def create
    unless Place.creatable?
      respond_not_authorized
      return
    end

    @place = Place.new place_params
    if @place.save
      redirect_to place_path(@place)
    else
      respond_with_errors @place
    end
  end

  def update
    unless @place.editable?
      respond_not_authorized
      return
    end

    if @place.update place_params
      redirect_to @place
    else
      respond_with_errors @place
    end
  end

  def destroy
    unless @place.editable?
      respond_not_authorized
      return
    end

    if @place.destroy
      redirect_to places_path
    else
      respond_with_errors @place
    end
  end

  private

  def set_place
    @place = Place.find(params[:id])
  end

  def set_places
    @places = Place.includes(:country).order('countries.name, places.name')
  end

  def place_params
    params.require(:place).permit(:name, :country_id, :latitude, :longitude, :msl, :kind)
  end
end

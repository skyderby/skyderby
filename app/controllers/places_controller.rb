class PlacesController < ApplicationController
  before_action :set_place, only: [:show, :edit, :update]

  def index
    @places = Place
                .includes(:country)
                .includes(:tracks)
                .group_by { |x| x.country }
  end

  def show
  end

  def edit
    authorize! :update, @place
  end

  def update
    authorize! :update, @place
    if @place.update place_params
      redirect_to places_path
    else
      redirect_to edit_place_path(@place)
    end
  end

  def new
    authorize! :create, :place
    @place = Place.new
  end

  def create
    authorize! :create, :place
    @place = Place.new place_params
    if @place.save
      redirect_to places_path
    else
      redirect_to new_place_path
    end
  end

  private

  def set_place
    @place = Place.find(params[:id])
  end

  def place_params
    params
      .require(:place)
      .permit(:name, :country_id, :latitude, :longitude, :msl)
  end
end

class PlacesController < ApplicationController
  before_action :set_place, only: [:show, :edit, :update]

  load_and_authorize_resource

  def index
    @places = Place.includes(:country).includes(:tracks).order(:name)

    if params[:query]
      @places = @places.search(params[:query][:term]) if params[:query][:term] 
    end

    respond_to do |format|
      format.html { @places = @places.group_by { |x| x.country } }
      format.json { @places }
    end
  end

  def show
  end

  def edit
  end

  def update
    if @place.update place_params
      redirect_to places_path
    else
      redirect_to edit_place_path(@place)
    end
  end

  def new
    @place = Place.new
  end

  def create
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
    params.require(:place).permit(
      :name, 
      :country_id, 
      :latitude, 
      :longitude, 
      :msl
    )
  end
end

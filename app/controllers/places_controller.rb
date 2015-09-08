class PlacesController < ApplicationController
  before_action :set_place, only: [:show, :edit, :update]

  load_and_authorize_resource

  def index
    @places = Place.includes(:country).includes(:tracks).order(:name)

    if params[:query]
      @places = @places.search(params[:query][:term]) if params[:query][:term]
    end

    respond_to do |format|
      format.html { @places }
      format.json { render @places, format: :json, locals: { with_details: false } }
    end
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
      :msl
    )
  end
end

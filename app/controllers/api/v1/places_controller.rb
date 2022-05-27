class Api::V1::PlacesController < Api::ApplicationController
  before_action :set_place, only: %i[show update destroy]

  def index
    authorize Place
    @places = Place.includes(:country)
                   .order('countries.name, places.name')
                   .search(params[:search])
                   .then { |relation| apply_filters(relation) }
                   .paginate(page: current_page, per_page: rows_per_page)
  end

  def show
    authorize @place
  end

  def create
    authorize Place
    @place = Place.new(place_params)

    if @place.save
      render
    else
      respond_with_errors(@place.errors)
    end
  end

  def update
    authorize @place

    if @place.update(place_params)
      render
    else
      respond_with_errors(@place.errors)
    end
  end

  def destroy
    authorize @place

    if @place.destroy
      render
    else
      respond_with_errors(@place.errors)
    end
  end

  private

  def set_place
    @place = Place.find(params[:id])
  end

  def apply_filters(relation)
    return relation if params[:ids].blank?

    relation.where(id: params[:ids])
  end

  def place_params
    params.require(:place).permit \
      :country_id,
      :kind,
      :name,
      :latitude,
      :longitude,
      :msl
  end
end

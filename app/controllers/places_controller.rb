class PlacesController < ApplicationController
  def index
    @places = Place
                .includes(:country)
                .includes(:tracks)
                .group_by { |x| x.country.name }
  end

  def show
    @place = Place.find(params[:id])
  end
end

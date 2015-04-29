module Api
  class PlacesController < ApplicationController
    def index
      @places = Place.includes(:country).order(:name)
      if params[:query] && params[:query][:term]
        @places = 
          @places.where('LOWER(name) LIKE LOWER(?)', "%#{params[:query][:term]}%")
      end
      @places
    end
  end
end

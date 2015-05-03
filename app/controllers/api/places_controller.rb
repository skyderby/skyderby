module Api
  class PlacesController < ApplicationController
    def index
      @places = Place.includes(:country).order(:name)

      if params[:query]
        @places = @places.search(params[:query][:term]) if params[:query][:term] 
      end
    end
  end
end

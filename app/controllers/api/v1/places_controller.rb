module Api
  module V1
    class PlacesController < Api::ApplicationController
      def index
        @places = Place.includes(:country)
                       .order('countries.name, places.name')
                       .search(params[:search])
                       .paginate(page: current_page, per_page: rows_per_page)
      end

      def show
        @place = Place.includes(:country).find(params[:id])
      end
    end
  end
end

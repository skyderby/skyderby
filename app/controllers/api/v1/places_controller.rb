module Api
  module V1
    class PlacesController < Api::ApplicationController
      def show
        @place = Place.find(params[:id])
      end
    end
  end
end

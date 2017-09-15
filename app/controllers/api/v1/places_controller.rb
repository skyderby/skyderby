module Api
  module V1
    class PlacesController < ApplicationController
      def show
        @place = Place.find(params[:id])
      end
    end
  end
end

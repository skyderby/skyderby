module Api
  module V1
    class PlacesController < Api::ApplicationController
      def show
        @place = Place.includes(:country, :finish_lines, photos: { image_attachment: :blob }).find(params[:id])
      end
    end
  end
end

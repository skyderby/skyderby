module Places
  class PreviewsController < ApplicationController
    def show
      @place = Place.find(params[:place_id])

      authorize @place

      respond_to do |format|
        format.js
      end
    end
  end
end

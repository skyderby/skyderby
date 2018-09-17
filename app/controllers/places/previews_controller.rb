module Places
  class PreviewsController < ApplicationController
    def show
      @place = Place.find(params[:place_id])

      respond_to do |format|
        format.js
      end
    end
  end
end

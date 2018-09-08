module Places
  class PhotosController < ApplicationController
    before_action :set_place

    def index
      @photos = @place.photos

      authorize @photos
    end

    def new
      @photo = @place.photos.new

      authorize @photo
    end

    def create
      @photo = @place.photos.new(photo_params)

      authorize @photo

      respond_to do |format|
        if @photo.save
          format.js
        else
          format.js { render 'errors/ajax_errors', errors: @photo.errors }
        end
      end
    end

    def destroy
      @photo = @place.photos.find(params[:id])

      authorize @photo

      respond_to do |format|
        if @photo.destroy
          format.js
        else
          format.js { render 'errors/ajax_errors', errors: @photo.errors }
        end
      end
    end

    private

    def set_place
      @place = Place.find(params[:place_id])
    end

    def photo_params
      params.require(:photo).permit(:image)
    end
  end
end

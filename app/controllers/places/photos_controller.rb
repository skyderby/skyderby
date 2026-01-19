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

      respond_to do |format|
        format.turbo_stream
      end
    end

    def create
      @photo = @place.photos.new(photo_params)

      authorize @photo

      if @photo.save
        respond_to do |format|
          format.turbo_stream
        end
      else
        respond_with_errors(@photo)
      end
    end

    def destroy
      @photo = @place.photos.find(params[:id])

      authorize @photo

      if @photo.destroy
        respond_to do |format|
          format.turbo_stream
        end
      else
        respond_with_errors(@photo)
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

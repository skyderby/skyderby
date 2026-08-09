module Places
  class PhotosController < ApplicationController
    before_action :set_place

    def index
      @photos = @place.photos
    end

    def new
      return respond_not_authorized unless Place::Photo.creatable?

      @photo = @place.photos.new

      respond_to do |format|
        format.turbo_stream
      end
    end

    def create
      return respond_not_authorized unless Place::Photo.creatable?

      @photo = @place.photos.new(photo_params)

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

      return respond_not_authorized unless @photo.deletable?

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

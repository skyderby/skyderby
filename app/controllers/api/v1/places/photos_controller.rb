module Api
  module V1
    module Places
      class PhotosController < Api::ApplicationController
        before_action -> { doorkeeper_authorize! :write }
        before_action :set_place

        def create
          return respond_not_authorized unless Place::Photo.creatable?

          @photo = @place.photos.new(image: params[:image])
          if @photo.save
            render :show, status: :created
          else
            render_errors @photo.errors.full_messages, status: :unprocessable_content
          end
        end

        def destroy
          photo = @place.photos.find(params[:id])
          return respond_not_authorized unless photo.deletable?

          photo.destroy
          head :no_content
        end

        private

        def set_place
          @place = Place.find(params[:place_id])
        end
      end
    end
  end
end

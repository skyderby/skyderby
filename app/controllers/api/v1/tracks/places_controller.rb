module Api
  module V1
    module Tracks
      class PlacesController < Api::ApplicationController
        before_action -> { doorkeeper_authorize! :write }, only: :create
        before_action :require_registered_user!
        before_action :set_track
        before_action :require_editable_track

        def new
          @new_place = ::Tracks::NewPlace.new(@track)
        end

        def create
          @new_place = ::Tracks::NewPlace.new(@track, place_params)

          if @new_place.save(user: current_user)
            @place = @new_place.__getobj__
            render :show, status: :created
          else
            render_errors @new_place.errors.full_messages, status: :unprocessable_content
          end
        end

        private

        def set_track
          @track = Track.find(params[:track_id])
        end

        def require_editable_track
          respond_not_authorized unless @track.editable?
        end

        def place_params
          permitted = %i[name country_id latitude longitude msl]
          permitted << :allow_duplicate if Place.creatable?

          params.require(:place).permit(*permitted)
        end
      end
    end
  end
end

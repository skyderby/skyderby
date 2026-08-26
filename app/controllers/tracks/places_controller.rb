module Tracks
  class PlacesController < ApplicationController
    before_action :set_track

    def new
      return respond_not_authorized unless creatable?

      @new_place = Tracks::NewPlace.new(@track)

      respond_to do |format|
        format.html { redirect_to @track }
        format.turbo_stream
      end
    end

    def create
      return respond_not_authorized unless creatable?

      @new_place = Tracks::NewPlace.new(@track, place_params)

      if @new_place.save(user: Current.user)
        redirect_to @track
      else
        render :new, formats: :turbo_stream, status: :unprocessable_content
      end
    end

    private

    def set_track
      @track = Track.find(params[:track_id])
    end

    def creatable?
      Current.user.registered? && @track.editable?
    end

    def place_params
      permitted = [:name, :country_id, :latitude, :longitude, :msl]
      permitted << :allow_duplicate if Place.creatable?

      params.require(:place).permit(*permitted)
    end
  end
end

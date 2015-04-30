module Api
  class EventTracksController < ApplicationController
    before_action :set_event_track, only: [:update, :destroy]

    def create
      @event_track = EventTrack.new event_track_params
      authorize! :update, @event_track.event

      if @event_track.save
        @event_track
      else
        render json: @event_track.errors, status: :unprocessible_entry
      end
    end

    def update
      authorize! :update, @event_track.event

      @event_track.update round_track_params
      respond_with @event_track
    end

    def destroy
      authorize! :update, @event_track.event

      @event_track.destroy
      head :no_content
    end

    private

    def set_event_track
      @event_track = EventTrack.find(params[:id])
    end

    def event_track_params
      params.require(:event_track).permit(
        :competitor_id, :round_id, :track_id,
        track_attributes: [:file, :user_profile_id, :place_id, :wingsuit_id])
    end
  end
end

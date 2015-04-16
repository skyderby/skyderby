module Api
  class RoundTracksController < ApplicationController
    before_action :set_round_track, only: [:update, :destroy]

    def create
      @round_track = EventTrack.new round_track_params
      @round_track.create_track!(round_track_params[:track_attributes]) unless @round_track.track_id

      respond_to do |format|
        if @round_track.save
          format.json do
            render json: @round_track.to_json, status: :ok
          end
        else
          respond_with status: :unprocessible_entry
        end
      end
    end

    def update
      @round_track.update round_track_params
      respond_with @round_track
    end

    def destroy
      @round_track.destroy
      respond_to do |format|
        format.json { head :no_content }
      end
    end

    private

    def set_round_track
      @round_track = EventTrack.find(params[:id])
    end

    def round_track_params
      params.require(:round_track).permit(
        :competitor_id, :round_id, :track_id,
        track_attributes: [:file, :user_profile_id, :place_id, :wingsuit_id])
    end
  end
end

module TrackFiles
  class TracksController < ApplicationController
    def create
      @track = build_track

      current_user.tracks << @track.id unless current_user.registered?

      redirect_to track_path(@track)
    end

    private

    def build_track
      track_attributes = track_params[:track_attributes].merge(
        track_file: track_file,
        owner: (current_user if current_user.registered?)
      )

      CreateTrackService.call(track_attributes, segment: params[:segment])
    end

    def track_params
      params.permit(
        :segment,
        track_attributes: [
          :name,
          :kind,
          :location,
          :place_id,
          :missing_suit_name,
          :suit_id,
          :comment,
          :visibility
        ]
      )
    end

    def track_file
      TrackFile.find(params[:track_file_id])
    end
  end
end

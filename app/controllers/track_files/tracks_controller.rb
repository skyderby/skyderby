module TrackFiles
  class TracksController < ApplicationController
    def create
      @track = build_track
      redirect_to edit_track_path(@track)
    end

    private

    def build_track
      track_attributes = track_params[:track_attributes].merge(
        track_file: track_file,
        user: current_user
      )

      CreateTrackService.new(
        track_attributes,
        segment: params[:segment]
      ).execute
    end

    def track_params
      params.permit(
        :segment,
        track_attributes: [
          :name,
          :kind,
          :location,
          :place_id,
          :suit,
          :wingsuit_id,
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

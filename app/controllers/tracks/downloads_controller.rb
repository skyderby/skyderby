module Tracks
  class DownloadsController < ApplicationController
    def show
      @track = Track.find(params[:track_id])

      authorize @track, :download?

      track_file = @track.track_file
      send_file track_file.file.download, filename: track_file.file.original_filename
    end
  end
end

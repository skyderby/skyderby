module Tracks
  class DownloadsController < ApplicationController
    def show
      @track = Track.find(params[:track_id])

      authorize @track, :edit?

      track_file = @track.track_file
      file_path = Paperclip.io_adapters.for(track_file.file).path
      send_file file_path, filename: track_file.file_file_name
    end
  end
end

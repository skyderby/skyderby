module Tracks
  class DownloadsController < ApplicationController
    def show
      @track = Track.find(params[:track_id])

      return respond_not_authorized unless @track.downloadable?

      track_file = @track.track_file
      send_data track_file.file.download, filename: track_file.file.filename.to_s,
                                          type: track_file.file.content_type
    end
  end
end

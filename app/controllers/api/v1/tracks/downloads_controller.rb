module Api
  module V1
    module Tracks
      class DownloadsController < Api::ApplicationController
        before_action -> { doorkeeper_authorize! :read }

        def show
          track = Track.find(params[:track_id])
          return respond_not_authorized unless track.downloadable?

          file = track.track_file&.file
          return render_errors(['Not found'], status: :not_found) unless file&.attached?

          send_data file.download, filename: file.filename.to_s, type: file.content_type
        rescue ActiveStorage::FileNotFoundError
          render_errors(['Not found'], status: :not_found)
        end
      end
    end
  end
end

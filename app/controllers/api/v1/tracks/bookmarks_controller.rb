module Api
  module V1
    module Tracks
      class BookmarksController < Api::ApplicationController
        before_action -> { doorkeeper_authorize! :write }
        before_action :require_registered_user!
        before_action :set_track

        def create
          @track.bookmark(user: current_user)
          render json: { bookmarked: true }
        end

        def destroy
          @track.unbookmark(user: current_user)
          render json: { bookmarked: false }
        end

        private

        def set_track
          @track = Track.find(params[:track_id])
          render_errors(['Not found'], status: :not_found) unless @track.viewable?
        end
      end
    end
  end
end

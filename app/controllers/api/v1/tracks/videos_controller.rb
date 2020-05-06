module Api
  module V1
    module Tracks
      class VideosController < ApplicationController
        def show
          track = authorize Track.includes(:video).find(params[:track_id])

          @video = track.video

          head(:not_found) if @video.blank?
        end
      end
    end
  end
end

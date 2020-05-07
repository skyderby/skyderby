module Api
  module V1
    module Tracks
      class VideosController < ApplicationController
        before_action :set_track

        def show
          authorize @track, :show?

          @video = @track.video

          head(:not_found) if @video.blank?
        end

        def create
          authorize @track, :update?

          @video = (@track.video || @track.build_video)
          @video.assign_attributes(video_params)

          respond_to do |format|
            if @video.save
              format.json
            else
              format.json do
                render json: { errors: @video.errors }, status: :unprocessable_entity
              end
            end
          end
        end

        def destroy
          authorize @track, :update?

          video = @track.video

          return head :no_content if video.blank?

          if video.destroy
            head :no_content
          else
            render json: { errors: video.errors }, status: :unprocessable_entity
          end
        end

        private

        def video_params
          params.require(:track_video).permit(
            :url,
            :video_code,
            :video_offset,
            :track_offset
          )
        end

        def set_track
          @track = Track.includes(:video).find(params[:track_id])
        end
      end
    end
  end
end

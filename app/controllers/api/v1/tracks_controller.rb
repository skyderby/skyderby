module Api
  module V1
    class TracksController < Api::ApplicationController
      before_action -> { doorkeeper_authorize! :write }

      def create
        if params[:file].blank?
          render json: { errors: ['File is required'] }, status: :unprocessable_content
          return
        end

        @track_file = Track::File.new(file: params[:file])
        unless @track_file.save
          render json: { errors: @track_file.errors.full_messages }, status: :unprocessable_content
          return
        end

        track_attributes = permitted_track_attributes.merge(
          track_file: @track_file,
          owner: current_resource_owner
        )

        @track = CreateTrackService.call(track_attributes)
        render json: { id: @track.id, url: track_url(@track) }, status: :created
      rescue CreateTrackService::MissingActivityData
        render json: { errors: ['No activity data found in file'] }, status: :unprocessable_content
      end

      private

      def permitted_track_attributes
        params.permit(:kind, :location, :place_id, :missing_suit_name, :suit_id, :comment, :visibility)
      end
    end
  end
end

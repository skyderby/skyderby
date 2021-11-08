module Api
  module V1
    module Tracks
      class FilesController < ApplicationController
        def create
          authorize Track

          @track_file = Track::File.new(track_file_params)

          respond_to do |format|
            if @track_file.save
              format.json
            else
              format.json do
                render json: { errors: @track_file.errors }, status: :unprocessable_entity
              end
            end
          end
        end

        private

        def track_file_params
          params.permit(:file)
        end
      end
    end
  end
end

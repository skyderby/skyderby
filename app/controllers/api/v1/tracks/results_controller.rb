module Api
  module V1
    module Tracks
      class ResultsController < ApplicationController
        def show
          authorize track
        end

        private

        def track
          @track ||= Track.find(params[:track_id])
        end
      end
    end
  end
end

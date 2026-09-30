module Api
  module V1
    module Tracks
      class ResultsController < Api::ApplicationController
        def show
          @track = Track.find(params[:track_id])
          return render_errors(['Not found'], status: :not_found) unless @track.viewable?

          @results = ::Tracks::Results.new(@track)
        end
      end
    end
  end
end

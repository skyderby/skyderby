module Api
  module V1
    module Tracks
      class LogbookEntriesController < Api::ApplicationController
        include ApiLogbookScoped

        def create
          track = Track.find(params[:track_id])
          return respond_not_authorized unless track.loggable?

          @jump = Jump.record_track(track)
          render 'api/v1/logbook/jumps/show', status: :created
        end
      end
    end
  end
end

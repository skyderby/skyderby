module Events
  module EventTracks
    class JumpRangesController < ApplicationController
      include EventScoped

      before_action :set_event, :authorize_event

      def show
        @event_track = @event.event_tracks.find(params[:event_track_id])

        respond_to do |format|
          format.js
        end
      end

      def update
      end
    end
  end
end

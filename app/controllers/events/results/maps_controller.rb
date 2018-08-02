module Events
  module Results
    class MapsController < ApplicationController
      include EventTrackScoped, EventScoped

      skip_before_action :authorize_event

      def show
        respond_to do |format|
          format.js
          format.json { @map_data = Events::Maps::CompetitorTrack.new(@result) }
        end
      end
    end
  end
end

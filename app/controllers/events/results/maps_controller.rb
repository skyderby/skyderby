module Events
  module Results
    class MapsController < ApplicationController
      include EventTrackScoped, EventScoped

      def show
        respond_to do |format|
          format.html
          format.js
          format.turbo_stream
          format.json { @map_data = Events::Maps::CompetitorTrack.new(@result) }
        end
      end
    end
  end
end

module Events
  module Scoreboards
    module Results
      def results
        @results ||= Collection.new(event.event_tracks, params)
      end
    end
  end
end

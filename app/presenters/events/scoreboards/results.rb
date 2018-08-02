module Events
  module Scoreboards
    module Results
      def results
        @results ||= Collection.new(event.results, params)
      end
    end
  end
end

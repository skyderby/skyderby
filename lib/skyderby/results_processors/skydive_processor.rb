require 'competitions/skydive_comp_range_finder'

module Skyderby
  module ResultsProcessors
    class SkydiveProcessor
      def initialize(track_points, params)
        @track_points = track_points

        validate! params
        @range_from = params[:range_from]
        @range_to = params[:range_to]

        @comp_window = SkydiveCompRange.for(
          @track_points,
          @range_from,
          @range_to
        )

        @start_point = @comp_window.start_point
        @end_point = @comp_window.end_point
      end

      def calculate
        fail NotImplementedError, 'Results processor must implement calculate method'
      end

      private

      def validate!(params)
        fail ArgumentError, 'Params should be the hash' unless params.is_a? Hash
        fail ArgumentError, 'Params should contain range_from' unless params[:range_from]
        fail ArgumentError, 'Params should contain range_to' unless params[:range_to]
      end
    end
  end
end

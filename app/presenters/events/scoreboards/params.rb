module Events
  module Scoreboards
    class Params
      def initialize(event, raw_params)
        @event = event
        @raw_params = raw_params
      end

      def omit_penalties?
        raw_params[:omit_penalties] == 'true'
      end

      def adjust_to_wind?
        event.wind_cancellation && !display_raw_results
      end

      def apply_penalty_to_score?
        event.apply_penalty_to_score
      end

      def apply_penalty_to_result?
        !apply_penalty_to_score?
      end

      def split_by_categories?
        raw_params[:split_by_categories].to_s.downcase != 'false'
      end

      private

      attr_reader :event, :raw_params

      def display_raw_results
        raw_params[:display_raw_results] == 'true'
      end
    end
  end
end

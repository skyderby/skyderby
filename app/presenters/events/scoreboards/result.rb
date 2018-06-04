module Events
  module Scoreboards
    class Result
      def initialize(record, collection, params)
        @record = record
        @collection = collection
        @params = params
      end

      def result
        @result ||=
          record
          .yield_self(&method(:adjust_to_wind))
          .yield_self(&method(:apply_penalty))
      end

      def penalized?
        return false if params.omit_penalties?
        record.penalized
      end

      def penalty_size
        return 0 if params.omit_penalties?
        record.penalty_size
      end

      def penalty_reason
        return '' if params.omit_penalties?
        record.penalty_reason
      end

      private

      attr_reader :record, :collection, :params

      def adjust_to_wind(record)
        if params.adjust_to_wind?
          record.result_net
        else
          record.result
        end
      end

      def apply_penalty(result)
        return result if params.omit_penalties?
        return result unless record.penalized

        result - result / 100 * record.penalty_size
      end
    end
  end
end

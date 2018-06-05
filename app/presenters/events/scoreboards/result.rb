module Events
  module Scoreboards
    class Result < SimpleDelegator
      def initialize(record, collection, params)
        @record = record
        @collection = collection
        @params = params

        super(@record)
      end

      def formated
        return if result.nil? || result.zero?

        if round.distance?
          result.truncate
        else
          result.round(1)
        end
      end

      def result
        @result ||=
          record
          .yield_self(&method(:adjust_to_wind))
          .yield_self(&method(:apply_penalty))
      end

      def formated_points
        return '' unless valid?

        points.round(1)
      end

      def points
        return 0 unless valid?

        best_result = collection.best_in(round: round, section: section)
        result / best_result.result * 100
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

      def valid?
        result&.positive?
      end

      def best_in_round_and_category?
        self == collection.best_in(round: round, section: section)
      end

      def best_in_category?
        self == collection.best_in(section: section)
      end

      def worst_in_category?
        self == collection.worst_in(section: section)
      end

      private

      attr_reader :record, :collection, :params
      delegate :round, :section, to: :record

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

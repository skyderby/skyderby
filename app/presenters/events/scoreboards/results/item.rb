module Events
  module Scoreboards
    module Results
      class Item < SimpleDelegator

        delegate :apply_penalty_to_result?, :apply_penalty_to_score?, to: :params

        def initialize(record, collection, params)
          @record = record
          @collection = collection
          @params = params

          super(@record)
        end

        def formated
          return '' unless valid?

          if round.distance?
            '%d' % result.round.truncate
          else
            '%.1f' % result.round(1)
          end
        end

        def result
          @result ||=
            record
            .then(&method(:adjust_to_wind))
            .then(&method(:apply_penalty_to_result))
        end

        def formated_points
          return '' unless valid?

          '%.1f' % points.round(1)
        end

        def points
          return 0 unless valid?

          @points ||=
            collection
            .best_in(round: round, section: section)
            .then { |best_result| result / best_result.result * 100 }
            .then(&method(:apply_penalty_to_score))
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
          result&.positive? || penalized?
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

        def apply_penalty_to_result(result)
          return result if params.omit_penalties?
          return result unless params.apply_penalty_to_result?
          return result unless record.penalized

          result - result / 100 * record.penalty_size
        end

        def apply_penalty_to_score(score)
          return score if params.omit_penalties?
          return score unless params.apply_penalty_to_score?
          return score unless record.penalized

          score - score / 100 * record.penalty_size
        end
      end
    end
  end
end

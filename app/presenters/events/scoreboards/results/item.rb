module Events
  module Scoreboards
    module Results
      class Item < SimpleDelegator
        delegate :apply_penalty_to_result?,
                 :apply_penalty_to_score?,
                 :adjust_to_wind?,
                 :omit_penalties?,
                 :split_by_categories?,
                 to: :params

        def initialize(record, collection, params)
          @record = record
          @collection = collection
          @params = params

          super(@record)
        end

        def formated
          return '' unless valid?

          if round.distance?
            format('%d', result.truncate)
          else
            format('%.1f', result)
          end
        end

        def result
          @result ||=
            record
            .then { |result| adjust_to_wind(result) }
            .then { |result| apply_penalty_to_result(result) }
            .then { |result| result.round(round_digits) }
        end

        def formated_points
          return '' unless valid?

          format('%.1f', points.round(1))
        end

        def points
          return 0 unless valid?

          @points ||=
            collection
            .best_in(best_score_lookup_context)
            .then { |best_result| result.to_d / best_result.result * 100 }
            .then { |score| apply_penalty_to_score(score) }
        end

        def penalized?
          return false if omit_penalties?

          record.penalized
        end

        def penalty_size
          return 0 if omit_penalties?

          record.penalty_size
        end

        def penalty_reason
          return '' if omit_penalties?

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
          if adjust_to_wind?
            record.result_net
          else
            record.result
          end
        end

        def round_digits
          round.distance? ? 0 : 1
        end

        def apply_penalty_to_result(result)
          return result if omit_penalties?
          return result unless apply_penalty_to_result?
          return result unless record.penalized

          result - (result / 100 * record.penalty_size)
        end

        def apply_penalty_to_score(score)
          return score if omit_penalties?
          return score unless apply_penalty_to_score?
          return score unless record.penalized

          score - (score / 100 * record.penalty_size)
        end

        def best_score_lookup_context
          if split_by_categories?
            { round: round, section: section }
          else
            { round: round }
          end
        end
      end
    end
  end
end

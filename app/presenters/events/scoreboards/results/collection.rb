module Events
  module Scoreboards
    module Results
      class Collection
        def initialize(event_results, params)
          @event_results = event_results
          @params = params
        end

        def for(args)
          find(args)
        end

        def best_in(args)
          find(args)&.max_by(&:result)
        end

        def worst_in(args)
          find(args)&.min_by(&:result)
        end

        private

        attr_reader :event_results, :params

        def find(args)
          index_section = lookup_section(**args)
          index_key     = lookup_key(**args)

          results_index.dig(index_section, index_key)
        end

        def lookup_key(round: nil, section: nil, competitor: nil) # rubocop:disable Metrics/PerceivedComplexity,Metrics/CyclomaticComplexity
          if round && section
            "#{round.id}-#{section.id}"
          elsif round && competitor
            "#{round.id}-#{competitor.id}"
          elsif round
            round.id
          elsif section
            section.id
          elsif competitor
            competitor.id
          end
        end

        def lookup_section(round: nil, section: nil, competitor: nil) # rubocop:disable Metrics/PerceivedComplexity,Metrics/CyclomaticComplexity
          if round && section
            :by_rounds_and_sections
          elsif round && competitor
            :by_rounds_and_competitors
          elsif round
            :by_rounds
          elsif section
            :by_sections
          elsif competitor
            :by_competitors
          end
        end

        ##
        # Results have following structure:
        # {
        #   by_rounds: {
        #     [round_id]: [result1, ...]
        #   },
        #   by_sections: {
        #     [section_id]: [result1, ...]
        #   },
        #   by_competitors: {
        #     [competitor_id]: [result1, ...]
        #   },
        #   by_rounds_and_sections: {
        #     "[round_id]-[section_id]": [result1, ...]
        #   },
        #   by_rounds_and_competitors: {
        #     "[round_id]-[competitor_id]": result1
        #   }
        # }
        def results_index # rubocop:disable Metrics/AbcSize
          @results_index ||= records.each_with_object(blank_index) do |record, memo|
            result = Item.new(record, self, params)
            memo[:by_rounds][record.round.id] << result
            memo[:by_sections][record.section.id] << result
            memo[:by_competitors][record.competitor.id] << result
            memo[:by_rounds_and_sections]["#{record.round.id}-#{record.section.id}"] << result
            memo[:by_rounds_and_competitors]["#{record.round.id}-#{record.competitor.id}"] = result
          end
        end

        def blank_index
          {}.tap do |index|
            index[:by_rounds_and_competitors] = {}

            [:by_rounds, :by_sections, :by_competitors, :by_rounds_and_sections].each do |key|
              index[key] = Hash.new { |h, k| h[k] = [] }
            end
          end
        end

        def records
          @records = event_results.includes(:round, competitor: :section).to_a
        end
      end
    end
  end
end

module Events
  module Scoreboards
    class ResultsCollection
      def initialize(event_tracks, params)
        @event_tracks = event_tracks
        @params = params
      end

      def for(**args)
        find(**args)
      end

      private

      attr_reader :event_tracks, :params

      def find(**args)
        index_section = lookup_section(**args)
        index_key     = lookup_key(**args)

        results_index.dig(index_section, index_key)
      end

      def lookup_key(round: nil, section: nil, competitor: nil)
        if round && section
          "#{round.id}-#{section.id}"
        elsif round && competitor
          "#{round.id}-#{competitor.id}"
        elsif round
          round.id
        elsif section
          section.id
        end
      end

      def lookup_section(round: nil, section: nil, competitor: nil)
        if round && section
          :by_rounds_and_sections
        elsif round && competitor
          :by_rounds_and_competitors
        elsif round
          :by_rounds
        elsif section
          :by_sections
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
      #   by_rounds_and_sections: {
      #     "[round_id]-[section_id]": [result1, ...]
      #   },
      #   by_rounds_and_competitors: {
      #     "[round_id]-[competitor_id]": result1
      #   }
      # }
      def results_index
        @results ||= records.each_with_object(blank_index) do |record, memo|
          result = Result.new(record, self, params)
          memo[:by_rounds][record.round.id] << result
          memo[:by_sections][record.section.id] << result
          memo[:by_rounds_and_sections]["#{record.round.id}-#{record.section.id}"] << result
          memo[:by_rounds_and_competitors]["#{record.round.id}-#{record.competitor.id}"] = result
        end
      end

      def blank_index
        {}.tap do |index|
          [:by_rounds, :by_sections, :by_rounds_and_sections, :by_rounds_and_competitors].each do |key|
            index[key] = Hash.new { |h, k| h[k] = [] }
          end
        end
      end

      def records
        @records = event_tracks.includes(:round, competitor: :section).to_a
      end
    end
  end
end

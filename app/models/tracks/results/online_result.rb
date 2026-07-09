module Tracks
  class Results
    class OnlineResult
      attr_reader :competition, :result, :participants, :own_results

      def initialize(row:, participants:, personal_score:, own_results:, track_id:)
        @competition = row.virtual_competition
        @result = row.result
        @wind_cancelled = row.wind_cancelled
        @participants = participants
        @personal_score = personal_score
        @own_results = own_results
        @track_id = track_id
      end

      def valid? = !@wind_cancelled && result.to_f.positive?

      def ranked? = valid? && @personal_score.present?

      def personal_best? = ranked? && @personal_score.track_id == @track_id

      def own_total = own_results.size

      def own_rank
        return unless ranked?

        own_results.count { |value| better_than?(value, result) } + 1
      end

      def top_percent
        return unless ranked? && participants.positive?

        [((@personal_score.rank.to_f / participants) * 100).ceil, 1].max
      end

      def gap_from_record
        return unless ranked? && @personal_score.result

        (@personal_score.result - result).abs
      end

      private

      def better_than?(candidate, reference)
        higher_is_better? ? candidate > reference : candidate < reference
      end

      def higher_is_better? = @competition.results_sort_order == 'descending'
    end
  end
end

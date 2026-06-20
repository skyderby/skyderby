class VirtualCompetition
  class Ranking
    class Annual < Ranking
      attr_reader :year

      def initialize(competition, scores, year:, **)
        @year = year.to_i
        super(competition, scores, **)
      end

      def show_rank_changes? = year == Date.current.year

      def rank_change_for(score)
        previous = previous_week_scores[score.profile_id]
        previous && previous.rank - score.rank
      end

      private

      def previous_week_scores
        return {} unless show_rank_changes?

        @previous_week_scores ||= Rails.cache.fetch(cache_key, expires_in: 15.minutes) do
          snapshot =
            VirtualCompetition::AnnualTopScore
            .at_snapshot(1.week.ago)
            .for_competition(competition)
            .for_year(year)

          snapshot = filter_and_rank(snapshot.includes(:track)) if jump_kind
          snapshot.index_by(&:profile_id)
        end
      end

      def cache_key = "vc/#{competition.id}/annual/#{year}/previous_week_scores/#{jump_kind || 'all'}"
    end
  end
end

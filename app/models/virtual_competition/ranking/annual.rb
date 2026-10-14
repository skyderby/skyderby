class VirtualCompetition
  class Ranking
    class Annual < Ranking
      SNAPSHOT_AGE = 1.week

      attr_reader :year

      def initialize(competition, year:, **)
        @year = year.to_i
        super(competition, **)
      end

      def show_rank_changes? = year == Date.current.year && !competition.multi_discipline?

      def rank_change_for(score)
        previous = previous_ranks[score.profile_id]
        previous && previous - score.rank
      end

      private

      def period = { year: }

      def previous_ranks
        return {} unless show_rank_changes?

        @previous_ranks ||= Rails.cache.fetch(previous_ranks_cache_key, expires_in: 15.minutes) do
          competition
            .standings(year:, snapshot_at: SNAPSHOT_AGE.ago, jump_kind:, gender:)
            .pluck(:profile_id, :rank)
            .to_h
        end
      end

      def previous_ranks_cache_key
        ['vc', competition.id, 'annual', year, 'previous_ranks', jump_kind || 'all', gender || 'open']
      end
    end
  end
end

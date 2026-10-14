module Landing
  class Leaderboard
    TOP_SCORES = 5
    KIND_ORDER = [nil, 'base', 'skydive', 'speed_skydiving'].freeze

    delegate :any?, to: :boards

    def boards
      @boards ||= competitions.map(&:ranking)
    end

    def top_scores(ranking) = ranking.all_scores.limit(TOP_SCORES)

    private

    def competitions
      VirtualCompetition
        .listed
        .where(display_on_start_page: true)
        .sort_by { |competition| [kind_position(competition), competition.name.downcase] }
    end

    def kind_position(competition)
      KIND_ORDER.index(competition.jumps_kind) || KIND_ORDER.size
    end
  end
end

module Landing
  class Leaderboard
    TOP_SCORES = 5
    KIND_ORDER = [nil, 'base', 'skydive', 'speed_skydiving'].freeze

    delegate :any?, to: :boards

    def boards
      @boards ||= competitions.map do |competition|
        VirtualCompetition::Ranking.new(competition, top_scores_for(competition))
      end
    end

    private

    def competitions
      VirtualCompetition
        .where(display_on_start_page: true)
        .sort_by { |competition| [kind_position(competition), competition.name.downcase] }
    end

    def kind_position(competition)
      KIND_ORDER.index(competition.jumps_kind) || KIND_ORDER.size
    end

    def top_scores_for(competition)
      competition
        .personal_top_scores
        .wind_cancellation(false)
        .includes(:profile, :suit, :track)
        .first(TOP_SCORES)
    end
  end
end

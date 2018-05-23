module VirtualCompetitions
  class Summary
    delegate :many?, to: :online_competitions
    delegate :each,  to: :online_competitions

    def online_competitions
      @online_competitions ||=
        VirtualCompetition
        .where(display_on_start_page: true)
        .includes(personal_top_scores: [:profile, :track])
        .group_by(&:jumps_kind)
    end
  end
end

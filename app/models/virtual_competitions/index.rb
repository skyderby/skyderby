module VirtualCompetitions
  class Index
    def initialize(include_archived:)
      @include_archived = include_archived
    end

    def include_archived? = @include_archived

    def active_groups
      @active_groups ||= grouped(VirtualCompetition.active)
    end

    def finished_groups
      return {} unless include_archived?

      @finished_groups ||= grouped(VirtualCompetition.finished)
    end

    def finished?
      finished_groups.any?
    end

    def athlete_count(competition)
      athlete_counts.fetch(competition.id, 0)
    end

    private

    def grouped(scope)
      scope.includes(:group).group_by(&:group_name)
    end

    def athlete_counts
      @athlete_counts ||=
        VirtualCompetition::PersonalTopScore.wind_cancellation(false).group(:virtual_competition_id).count
    end
  end
end

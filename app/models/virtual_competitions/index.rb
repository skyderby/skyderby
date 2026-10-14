module VirtualCompetitions
  class Index
    def initialize(include_archived:, user:)
      @include_archived = include_archived
      @user = user
    end

    def include_archived? = @include_archived

    def active_groups
      @active_groups ||= grouped(visible_competitions.active, :active)
    end

    def finished_groups
      return [] unless include_archived?

      @finished_groups ||= grouped(visible_competitions.finished, :finished)
    end

    def finished?
      finished_groups.any?
    end

    def athlete_count(competition)
      athlete_counts.fetch(competition.id, 0)
    end

    def combined_athlete_count(group)
      combined_athlete_counts.fetch(group.section).fetch(group.id, 0)
    end

    private

    def visible_competitions = VirtualCompetition.listable(@user)

    def grouped(scope, section)
      scope.includes(:place, :disciplines, group: :virtual_competitions).group_by(&:group).map do |group, competitions|
        sorted = competitions.sort_by { |competition| [-athlete_count(competition), competition.name.to_s] }

        Group.new(group, sorted, section, self)
      end
    end

    def athlete_counts
      @athlete_counts ||= VirtualCompetition::Standing.group(:virtual_competition_id).count
    end

    def combined_athlete_counts
      @combined_athlete_counts ||= {
        active: distinct_athlete_counts(active_groups),
        finished: distinct_athlete_counts(finished_groups)
      }
    end

    def distinct_athlete_counts(groups)
      ids = groups.flat_map { |group| group.combined_competitions.map(&:id) }
      return {} if ids.empty?

      VirtualCompetition::Standing
        .ranked(competition_ids: ids)
        .joins(:virtual_competition)
        .group('virtual_competitions.group_id')
        .distinct
        .count(:profile_id)
    end
  end
end

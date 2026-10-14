module Profiles
  class RankingPositions
    def initialize(profile)
      @profile = profile
    end

    def by_competition
      filtered_results
    end

    private

    attr_reader :profile

    def filtered_results
      results.group_by(&:virtual_competition).each_value do |scores|
        next if scores.count == 3

        position = scores.detect { |score| score.profile_id == profile.id }
        ranks_range = (position.rank - 1)..(position.rank + 1)
        scores.select! { |score| ranks_range.cover? score.rank }
      end
    end

    def results
      standings
        .includes(:profile, :virtual_competition)
        .joins(profile_scores_join)
        .order(:virtual_competition_id, :rank)
    end

    def standings
      VirtualCompetition::Standing
        .ranked(
          competition_ids: VirtualCompetition.listed.ids,
          period: VirtualCompetition::Standing.period(year: Time.zone.now.year),
          multi_discipline: false
        )
    end

    def profile_scores_join
      table = VirtualCompetition::Standing.table_name

      <<~SQL.squish
        INNER JOIN (#{standings.where(profile_id: profile.id).to_sql}) AS profile_scores
        ON profile_scores.virtual_competition_id = #{table}.virtual_competition_id
        AND #{table}.rank BETWEEN profile_scores.rank - 2 AND profile_scores.rank + 2
      SQL
    end
  end
end

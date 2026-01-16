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
      VirtualCompetition::AnnualTopScore
        .includes(:profile, :virtual_competition)
        .for_year(current_year)
        .joins(profile_scores_join)
    end

    def profile_scores_join
      profile_scores_sql = VirtualCompetition::AnnualTopScore.where(profile_id: profile.id).to_sql

      <<~SQL.squish
        INNER JOIN (#{profile_scores_sql}) AS profile_scores
        ON profile_scores.virtual_competition_id = #{VirtualCompetition::AnnualTopScore.table_name}.virtual_competition_id
        AND profile_scores.year = #{VirtualCompetition::AnnualTopScore.table_name}.year
        AND #{VirtualCompetition::AnnualTopScore.table_name}.rank BETWEEN profile_scores.rank - 2 AND profile_scores.rank + 2
      SQL
    end

    def current_year
      Time.zone.now.year
    end
  end
end

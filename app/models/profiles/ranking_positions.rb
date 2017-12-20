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
        position = scores.detect { |score| score.profile == profile }
        ranks_range = (position.rank - 1)..(position.rank + 1)
        scores.select! { |score| ranks_range.cover? score.rank }
      end
    end

    def results
      AnnualTopScore.joins(<<~SQL).includes(:profile, :virtual_competition)
        INNER JOIN (#{profile_scores_query}) AS profile_scores
        ON profile_scores.virtual_competition_id = annual_top_scores.virtual_competition_id
        AND profile_scores.year = annual_top_scores.year
        AND annual_top_scores.rank BETWEEN profile_scores.rank - 2 AND profile_scores.rank + 2
      SQL
    end

    def profile_scores_query
      AnnualTopScore.where(profile: profile).to_sql
    end
  end
end

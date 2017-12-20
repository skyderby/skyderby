module Profiles
  class Overview < SimpleDelegator
    def ranking_positions
      @ranking_positions ||= Profiles::RankingPositions.new(profile).by_competition
    end

    private

    def profile
      __getobj__
    end
  end
end

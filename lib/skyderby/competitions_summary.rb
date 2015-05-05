module Skyderby
  class CompetitionsSummary
    attr_accessor :online, :officials, :warm_ups
    def initialize
      @online = online_competitions_info
      @officials = official_competitions_info
      @warm_ups = warm_ups_competitions_info
    end

    private

    def online_competitions_info
      {skydive: VirtualCompetition.skydive.size, base: VirtualCompetition.base.size}
    end

    def official_competitions_info
      {skydive: Event.officials.size, base: 0}
    end

    def warm_ups_competitions_info
      {skydive: Event.warm_ups.size, base: 0}
    end
  end
end

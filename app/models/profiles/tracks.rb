module Profiles
  class Tracks < SimpleDelegator
    attr_reader :tracks

    def initialize(profile, tracks)
      @profile = profile
      @tracks = tracks

      super @profile
    end

    def tracks_by_month
      tracks.group_by { |x| x.recorded_at.beginning_of_month }
    end

    private

    attr_reader :profile
  end
end

module Tracks
  module TrackViewBase
    include ChartPreferences
    include WindCancellation
    include Summary, GlideRatioChart, SpeedsChart, ElevationDistanceChart

    def glide_ratio_presenter
      ValuePresenters::GlideRatio.new
    end

    def speed_presenter
      ValuePresenters::Speed.new(chart_preferences.preferred_units)
    end

    def altitude_presenter
      ValuePresenters::Altitude.new(chart_preferences.preferred_units)
    end

    def distance_presenter
      ValuePresenters::Distance.new(chart_preferences.preferred_units)
    end

    def missing_ranges
      return [] if points.blank?

      MissingRangesPresenter.call(
        track.missing_ranges,
        points.first[:fl_time],
        points.last[:fl_time]
      )
    end

    protected

    attr_reader :chart_preferences
  end
end

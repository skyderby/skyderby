module Tracks
  module ElevationDistanceChart
    extend ActiveSupport::Concern

    included do
      delegate :altitude_chart_line,
               :elevation_chart_line,
               :distance_chart_line,
               to: :elevation_distance_chart_data
    end

    private

    def elevation_distance_chart_data
      @elevation_distance_chart_data ||= ChartData.new(points, altitude_presenter, distance_presenter)
    end
  end
end

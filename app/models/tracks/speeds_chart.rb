module Tracks
  module SpeedsChart
    extend ActiveSupport::Concern

    included do
      delegate :ground_speed_chart_line,
               :vertical_speed_chart_line,
               :full_speed_chart_line,
               :wind_effect_speed_chart_line,
               to: :speeds_chart_data
    end

    private

    def speeds_chart_data
      @speeds_chart_data ||= ChartData.new(points, zerowind_points, speed_presenter)
    end
  end
end

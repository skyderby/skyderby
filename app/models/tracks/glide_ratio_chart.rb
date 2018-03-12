module Tracks
  module GlideRatioChart
    extend ActiveSupport::Concern

    included do
      delegate :glide_ratio_chart_line, :wind_effect_glide_ratio_chart_line, to: :glide_ratio_chart_data
    end

    private

    def glide_ratio_chart_data
      @glide_ratio_chart_data ||= ChartData.new(points, zerowind_points, glide_ratio_presenter)
    end
  end
end

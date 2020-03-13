module Tracks
  module Summary
    extend ActiveSupport::Concern

    included do
      delegate :glide_ratio,
               :min_glide_ratio,
               :max_glide_ratio,
               :zero_wind_glide_ratio,
               :glide_ratio_wind_effect,
               to: :glide_ratio_summary

      delegate :avg_vertical_speed,
               :min_vertical_speed,
               :max_vertical_speed,
               to: :vertical_speed_summary

      delegate :avg_horizontal_speed,
               :min_horizontal_speed,
               :max_horizontal_speed,
               :zero_wind_horizontal_speed,
               :zero_wind_horizontal_speed_in_percents,
               :horizontal_speed_wind_effect,
               :horizontal_speed_wind_effect_in_percents,
               to: :horizontal_speed_summary

      delegate :distance,
               :zero_wind_distance,
               :distance_wind_effect,
               :distance_wind_effect_in_percents,
               :zero_wind_distance_in_percents,
               to: :distance_summary
    end

    def glide_ratio_summary
      @glide_ratio_summary ||= GlideRatioSummary.new(
        points,
        zerowind_points,
        track_elevation,
        track_distance,
        zero_wind_track_distance,
        glide_ratio_presenter
      )
    end

    def vertical_speed_summary
      @vertical_speed_summary ||= VerticalSpeedSummary.new(
        points,
        track_elevation,
        time,
        speed_presenter
      )
    end

    def horizontal_speed_summary
      @horizontal_speed_summary ||= HorizontalSpeedSummary.new(
        points,
        zerowind_points,
        track_distance,
        zero_wind_track_distance,
        time,
        speed_presenter
      )
    end

    def distance_summary
      @distance_summary ||= DistanceSummary.new(
        track_distance,
        zero_wind_track_distance,
        distance_presenter
      )
    end

    def elevation
      altitude_presenter.call(track_elevation)
    end

    def time
      return 0.0 if points.blank?

      (points.last[:gps_time] - points.first[:gps_time]).round(1)
    end

    def straight_line_distance
      TrackSegment.new([points.first, points.last]).distance
    end

    def track_trajectory_distance
      @track_trajectory_distance ||= calculate_trajectory_distance(points)
    end

    def zero_wind_trajectory_distance
      @zero_wind_trajectory_distance ||= calculate_trajectory_distance(zerowind_points)
    end

    def calculate_trajectory_distance(points)
      points.each_cons(2).inject(0) do |sum, pair|
        sum + TrackSegment.new(pair).distance
      end
    end
  end
end

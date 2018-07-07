class Tournament < ApplicationRecord
  module SubmissionResult
    extend ActiveSupport::Concern

    SECONDS_BEFORE_START = 10

    included do
      before_save :calculate_result
    end

    def calculate_result
      return unless track
      return unless start_time

      # In case judge will use result from stop-watch
      return if track.blank? && result&.positive?

      intersection_point = PathIntersectionFinder.new(
        track_points,
        finish_line
      ).execute

      self.result = (intersection_point[:gps_time].to_f - start_time.to_f).round(3)
    rescue PathIntersectionFinder::IntersectionNotFound
      on_intersection_not_found
    end

    def on_intersection_not_found
      self.result = 0
    end

    def track_points
      PointsQuery.execute(
        track,
        trimmed: { seconds_before_start: 20 },
        only: %i[gps_time altitude latitude longitude]
      )
    end
  end
end

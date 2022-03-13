class Event::Result < ApplicationRecord
  module FlightDetails
    extend ActiveSupport::Concern

    included do
      before_save :save_flight_details
    end

    def save_flight_details
      return unless exit_point

      self.exited_at = exit_point[:gps_time]
      self.exit_altitude = exit_point[:altitude]
      self.heading_within_window = window_points.direction
    end

    def exit_point
      gr_threshold = 10

      points
        .each_cons(15).find(-> { [points.first] }) do |range|
          range.all? { |point| point[:glide_ratio] < gr_threshold }
        end
        .first
    end
  end
end

class Event::Result < ApplicationRecord
  module ExitTime
    extend ActiveSupport::Concern

    def exit_time
      return unless track_id

      Rails.cache.fetch("#{cache_key}/exit_time", expires_in: 1.hour) do
        PointsQuery
          .execute(track, trimmed: true, only: [:gps_time]).first
          .then { |start_point| start_point && start_point[:gps_time] }
      end
    end
  end
end

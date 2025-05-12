require 'vincenty'

class Suit::PerformanceStats < ApplicationRecord
  belongs_to :suit
  belongs_to :profile

  def self.calculate(suit) = transaction do
    where(suit:).delete_all
    gps_type = [Track.gps_types[:flysight], Track.gps_types[:flysight2]]
    profiles_with_enough_tracks =
      Track
      .where(suit:, gps_type:)
      .where.not(profile_id: nil)
      .group(:profile_id)
      .having('count(*) > 5')
      .select(:profile_id)

    tracks_by_profile = Track.where(profile_id: profiles_with_enough_tracks, gps_type:).group_by(&:profile_id)
    tracks_by_profile.each do |profile_id, tracks|
      puts "Processing profile #{profile_id}, tracks: #{tracks.count}"

      glides = tracks.each_with_object(Hash.new { |h,k| h[k] = [] }) do |track, aggregate|
        points = PointsQuery.execute(
          track,
          trimmed: true,
          only: %i[gps_time altitude latitude longitude]
        )

        points_by_time = points.index_by { |point| point[:gps_time].iso8601(3) }

        points.each do |start_point|
          end_time = (start_point[:gps_time] + 3.seconds).iso8601(3)
          end_point = points_by_time[end_time]
          next unless end_point

          distance = Vincenty.distance_between_points(start_point, end_point)
          altitude_change = start_point[:altitude] - end_point[:altitude]

          glide = distance / altitude_change
          total_speed = Math.sqrt(distance**2 + altitude_change**2) / 3

          next if glide < 0.1 || glide > 7

          aggregate[glide.round(1)] << total_speed.round(1)
        end
      end

      glides.each do |glide_ratio, speeds|
        size = speeds.size
        next unless size > 5

        lower_bound = (size * 0.2).ceil
        upper_bound = (size * 0.8).floor
        samples = speeds.sort[lower_bound...upper_bound]
        average_full_speed = samples.sum / samples.size

        create!(suit:, profile_id:, glide_ratio:, average_full_speed:)
      end
    end
  end
end

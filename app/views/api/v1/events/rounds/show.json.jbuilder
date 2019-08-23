json.discipline @round.discipline
json.number @round.number
json.designatedLaneStart @round.designated_lane_start

json.groups do
  json.array! @round.groups do |group|
    json.array! group do |competitor_result|
      json.extract! competitor_result, :id, :name, :result, :penalized
      json.competitorId competitor_result.competitor_id
      json.penaltySize competitor_result.penalty_size
      json.penaltyReason competitor_result.penalty_reason

      json.photo competitor_result.photo.url(:thumb)

      json.direction competitor_result.direction.to_i

      json.afterExitPoint do
        json.extract! competitor_result.after_exit_point, :latitude, :longitude
      end

      json.startPoint do
        json.extract! competitor_result.start_point, :latitude, :longitude
        json.gpsTime competitor_result.start_point[:gps_time]
      end

      json.endPoint do
        json.extract! competitor_result.end_point, :latitude, :longitude
        json.gpsTime competitor_result.end_point[:gps_time]
      end

      json.points competitor_result.points do |point|
        json.extract! point, :latitude, :longitude, :altitude
        json.vSpeed point[:v_speed]
        json.gpsTime point[:gps_time]
        json.absAltitude point[:abs_altitude]
      end
    end
  end
end

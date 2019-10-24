json.key_format! camelize: :lower

json.editable policy(@round.event).update? && !@round.event.finished?

json.extract! @round, :id, :discipline, :number

json.groups do
  json.array! @round.groups do |group|
    json.array! group.map(&:id)
  end
end

json.reference_point_assignments do
  json.array! @round.reference_point_assignments do |assignment|
    json.extract! assignment, :reference_point_id, :competitor_id
  end
end

json.results do
  json.array! @round.competitor_results do |competitor_result|
    json.extract! competitor_result,
                  :id,
                  :name,
                  :competitor_id,
                  :result,
                  :penalized,
                  :penalty_size,
                  :penalty_reason

    json.photo competitor_result.photo.url(:thumb)

    json.direction competitor_result.direction.to_i
    json.exitAltitude competitor_result.exit_altitude.to_i

    json.afterExitPoint do
      json.extract! competitor_result.after_exit_point, :latitude, :longitude
    end

    json.startPoint do
      json.extract! competitor_result.start_point, :latitude, :longitude, :gps_time
    end

    json.endPoint do
      json.extract! competitor_result.end_point, :latitude, :longitude, :gps_time
    end

    json.points competitor_result.points do |point|
      json.extract! point, :latitude, :longitude, :altitude, :v_speed, :gps_time, :abs_altitude
    end
  end
end

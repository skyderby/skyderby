json.extract! event,
              :id,
              :name,
              :place_id,
              :visibility,
              :status,
              :starts_at,
              :use_teams,
              :range_from,
              :range_to

json.designated_lane_start event.designated_lane_start.camelize(:lower)

json.permissions do
  json.can_edit policy(event).edit?
end

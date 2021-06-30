json.extract! event,
              :id,
              :name,
              :place_id,
              :visibility,
              :status,
              :starts_at,
              :range_from,
              :range_to

json.permissions do
  json.can_edit policy(event).edit?
end

json.extract! event,
              :id,
              :name,
              :starts_at,
              :place_id,
              :visibility,
              :status

json.permissions do
  json.can_edit policy(event).edit?
end

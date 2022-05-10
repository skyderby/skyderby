json.extract! event,
              :id,
              :name,
              :starts_at,
              :visibility,
              :status,
              :created_at,
              :updated_at

json.permissions do
  json.can_edit policy(event).edit?
end

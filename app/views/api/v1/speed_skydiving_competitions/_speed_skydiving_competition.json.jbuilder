json.extract! event,
              :id,
              :name,
              :starts_at,
              :place_id,
              :visibility,
              :status,
              :use_teams,
              :use_open_scoreboard,
              :created_at,
              :updated_at

json.permissions do
  json.can_edit policy(event).edit?
end

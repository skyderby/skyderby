json.extract! event,
              :id,
              :name,
              :starts_at,
              :place_id,
              :visibility,
              :status,
              :use_teams,
              :use_open_scoreboard

json.permissions do
  json.can_edit policy(event).edit?
end

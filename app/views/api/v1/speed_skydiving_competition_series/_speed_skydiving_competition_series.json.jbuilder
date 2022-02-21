json.extract! event,
              :id,
              :name,
              :starts_at,
              :visibility,
              :status,
              :competition_ids,
              :created_at,
              :updated_at

json.permissions do
  json.can_edit policy(event).edit?
end

json.relations do
  competitions = event.competitions
  json.competitions competitions,
                    partial: 'api/v1/speed_skydiving_competitions/speed_skydiving_competition',
                    as: :event
end

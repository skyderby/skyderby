json.id track.id
json.kind track.kind
json.recorded_at track.recorded_at&.utc&.iso8601
json.location track.location
json.has_video track.video.present?
if track.place
  json.place { json.partial! 'api/v1/virtual_competitions/place', place: track.place }
else
  json.place nil
end

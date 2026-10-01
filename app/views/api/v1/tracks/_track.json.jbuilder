json.extract! track, :id, :kind, :visibility, :name, :comment, :location, :missing_suit_name
json.recorded_at track.recorded_at&.iso8601
json.created_at track.created_at&.iso8601
json.updated_at track.updated_at&.iso8601
json.url track_url(track)

if track.pilot
  json.pilot do
    json.extract! track.pilot, :id, :name
    json.country_code track.pilot.country&.code
    json.contributor track.pilot.contributor?
  end
else
  json.pilot nil
end

if track.suit
  json.suit do
    json.extract! track.suit, :id, :name, :kind
    json.manufacturer do
      json.extract! track.suit.manufacturer, :id, :name
    end
  end
else
  json.suit nil
end

if track.place
  json.place do
    json.extract! track.place, :id, :name, :kind
    json.country_code track.place.country&.code
    json.msl track.place.msl&.to_f
    if local_assigns[:detailed]
      json.latitude track.place.latitude&.to_f
      json.longitude track.place.longitude&.to_f
    end
  end
else
  json.place nil
end

json.results do
  json.distance track.distance&.result
  json.speed track.speed&.result
  json.time track.time&.result
end

json.has_video track.video.present?
json.owned track.belongs_to_user? && track.owner_id == Current.user&.id

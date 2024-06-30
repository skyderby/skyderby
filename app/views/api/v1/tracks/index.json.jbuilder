json.extract! @tracks, :current_page, :total_pages

json.items @tracks do |track|
  json.extract! \
    track,
    :id,
    :kind,
    :visibility,
    :profile_id,
    :suit_id,
    :place_id,
    :missing_suit_name,
    :location,
    :comment

  json.pilot_name track.name
  json.distance track.distance&.result.to_i
  json.speed track.speed&.result.to_i
  json.time track.time&.result.to_f.round(1)
  json.created_at track.created_at.iso8601
  json.updated_at track.created_at.iso8601
  json.recorded_at track.recorded_at.iso8601
end

json.partial! partial: 'api/v1/tracks/relations', tracks: @tracks

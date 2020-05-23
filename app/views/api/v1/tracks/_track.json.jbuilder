json.key_format! camelize: :lower

editable = policy(track).edit?
downloadable = policy(track).download?

json.editable editable
json.downloadable downloadable

json.extract! track, :id, :comment, :profile_id, :suit_id, :place_id, :data_frequency
json.pilot_name track.name
json.suit_name track.missing_suit_name
json.place_name track.location
json.created_at track.created_at.strftime('%d.%m.%Y')
json.recorded_at track.recorded_at.strftime('%d.%m.%Y')

json.jump_range do
  json.from track.ff_start
  json.to track.ff_end
end

json.has_video track.video.present?

if downloadable && track.track_file
  json.filename track.track_file.file.original_filename
  json.download_url track_download_path(track)
end

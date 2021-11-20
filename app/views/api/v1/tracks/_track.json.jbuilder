json.key_format! camelize: :lower

json.extract! track,
              :id,
              :kind,
              :comment,
              :profile_id,
              :suit_id,
              :place_id,
              :missing_suit_name,
              :location,
              :data_frequency,
              :visibility

json.pilot_name track.name
json.created_at track.created_at.strftime('%d.%m.%Y')
json.recorded_at track.recorded_at.strftime('%d.%m.%Y')

json.jump_range do
  json.from track.ff_start
  json.to track.ff_end
end

json.has_video track.video.present?

downloadable = policy(track).download?

if downloadable && track.track_file
  json.filename track.track_file.file.original_filename
  json.download_url assets_track_file_path(track)
end

json.permissions do
  json.can_edit policy(track).edit?
  json.can_download downloadable
  json.can_edit_ownership policy([:track, :ownership]).edit?
end

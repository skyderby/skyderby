json.extract! event_track,
              :id,
              :round_id,
              :competitor_id,
              :track_id,
              :result
json.created_at event_track.created_at.strftime('%e.%m.%Y %H:%M:%S')
json.url track_path(id: event_track.track_id)
json.track_presentation event_track.track.presentation
json.uploaded_by event_track.uploaded_by, :id, :name if event_track.uploaded_by

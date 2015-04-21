json.extract! event_track,
              :id,
              :round_id,
              :competitor_id,
              :track_id,
              :result
json.url track_path(id: event_track.track_id)
json.track_presentation event_track.track.presentation

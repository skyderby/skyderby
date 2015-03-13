json.extract! round_track,
              :id,
              :round_id,
              :competitor_id,
              :track_id,
              :result
json.url track_path(id: round_track.track_id)
json.track_presentation round_track.track.presentation

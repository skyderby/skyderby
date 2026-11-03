json.extract! jump, :id, :client_uuid, :kind, :number, :jumped_at, :place_id, :place_name, :suit_id, :equipment,
              :jump_type, :aircraft, :object_type, :wind_strength, :wind_direction, :exit_altitude,
              :deployment_altitude, :freefall_seconds, :canopy_seconds, :shared_with, :notes, :track_id,
              :updated_at, :deleted_at
json.place_label jump.place_label
json.suit_name jump.suit_name

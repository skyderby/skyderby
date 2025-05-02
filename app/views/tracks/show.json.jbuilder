json.key_format! camelize: :lower

json.extract! @track, :id, :profile_id, :suit_id, :place_id
json.name @track.pilot&.name.presence || @track.name
json.suit @track.suit&.name.presence || @track.missing_suit_name
json.place @track.place&.name.presence || @track.location
json.recorded_at @track.recorded_at.iso8601

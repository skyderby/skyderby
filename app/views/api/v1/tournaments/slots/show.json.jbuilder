json.key_format! camelize: :lower

slot = @slot
track = slot.track

json.partial!('api/v1/tournaments/slots/slot', slot:)
json.start_time slot.start_time&.utc&.iso8601(3)
json.ff_start track&.ff_start
json.ff_end track&.ff_end
json.landing_fl_time track&.landing_fl_time

json.key_format! camelize: :lower

result = @result
track = result.track

json.id result.id
json.round_id result.qualification_round_id
json.competitor_id result.competitor_id
json.track_id result.track_id
json.result api_float(result.result, 3)
json.start_time result.start_time&.utc&.iso8601(3)
json.detected_start_time result.detected_start_time&.utc&.iso8601(3)
json.canopy_time api_float(result.canopy_time, 1)
json.ff_start track&.ff_start
json.ff_end track&.ff_end
json.landing_fl_time track&.landing_fl_time

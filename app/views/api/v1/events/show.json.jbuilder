json.key_format! camelize: :lower

json.extract! @event, :id, :name, :range_from, :range_to, :designated_lane_start

json.range_from @round_map.range_from
json.range_to @round_map.range_to
json.start_time @round_map.start_time
json.stop_time @round_map.stop_time
json.boundaries_position @round_map.boundaries_position
json.competitors do
  json.array! @round_map.competitors do |competitor|
    json.extract! competitor, :name, :color, :points
  end
end

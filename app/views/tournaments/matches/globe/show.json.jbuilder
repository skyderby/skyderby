json.finish_line @match_map.finish_line
json.finish_line_minimums [@match_map.stop_altitude] * 2
json.center_line @match_map.center_line
json.center_line_minimums @match_map.center_line_minimums
json.competitors do
  json.array! @match_map.competitors do |competitor|
    json.extract! competitor, :name, :color, :points
  end
end

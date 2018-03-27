json.array! @points do |point|
  json.array! [point[:fl_time].to_i, point[:altitude].to_i]
end

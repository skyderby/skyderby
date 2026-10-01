json.key_format! camelize: :lower

json.positions @positions do |position|
  json.gps_time position[:gps_time].iso8601(3)
  json.pitch position[:pitch].round(1)
end

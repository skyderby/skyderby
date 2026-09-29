json.key_format! camelize: :lower

json.count @point_series.count
@point_series.columns.each do |column, values|
  json.set! column, values
end

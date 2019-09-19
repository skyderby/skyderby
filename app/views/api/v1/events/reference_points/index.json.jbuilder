json.array! @reference_points do |reference_point|
  json.extract! reference_point, :id, :name, :latitude, :longitude
end

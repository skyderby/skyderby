json.key_format! camelize: :lower
json.array! @trajectories do |points|
  json.array! points do |point|
    json.latitude point[:latitude].to_f
    json.longitude point[:longitude].to_f
    json.h_speed point[:h_speed].to_f
  end
end

json.key_format! camelize: :lower

json.video_settings do
  json.track_offset video.track_offset.to_f
  json.video_offset video.video_offset.to_f
end
json.points points do |point|
  json.extract! point, :fl_time, :altitude, :glide_ratio
  json.full_speed Track::Points.to_kmh(point.full_speed)
  json.h_speed Track::Points.to_kmh(point.h_speed)
  json.v_speed Track::Points.to_kmh(point.v_speed)
end

json.key_format! camelize: :lower

json.video_settings do
  json.track_offset video.track_offset.to_f
  json.video_offset video.video_offset.to_f
end
json.points points do |point|
  json.extract! point, :fl_time, :altitude, :full_speed, :h_speed, :v_speed, :glide_ratio
end

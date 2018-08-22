json.extract! @track_data, :video_offset, :track_offset
json.points @track_data.points do |point|
  json.extract! point, :fl_time, :altitude, :h_speed, :v_speed, :glide_ratio
end

json.key_format! camelize: :lower

json.extract! @video, :url, :video_code, :track_offset, :video_offset

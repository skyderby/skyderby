json.key_format! camelize: :lower

json.partial! 'api/v1/sync/place', place: @place

json.country do
  json.extract! @place.country, :id, :name, :code
end

json.photos @place.attached_photos do |photo|
  json.id photo.id
  json.thumb_url stored_file_url(photo.image_url(:thumb))
  json.large_url stored_file_url(photo.image_url(:large))
end

json.finish_lines @place.finish_lines, partial: 'api/v1/sync/place_finish_line', as: :place_finish_line
json.terrain_profile_ids @place.terrain_profiles.published.order(:id).ids
json.last_track_recorded_at @place.last_track_recorded_at
json.tracks_count @place.accessible_tracks.count
json.recent_track_ids @place.accessible_tracks.order(recorded_at: :desc).limit(10).ids
json.visited_count @place.accessible_profiles.count

json.visited_profiles @place.visited_profiles_sample do |profile|
  json.extract! profile, :id, :name, :country_id
  json.photo { json.partial! 'api/v1/profiles/photo', profile: }
end

json.popular_times @place.popular_times do |item|
  json.extract! item, :month, :track_count, :people_count
end

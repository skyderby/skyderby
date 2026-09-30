json.extract! terrain_profile, :id, :name, :place_id, :track_id
json.place_name terrain_profile.place&.name
json.full_name terrain_profile.full_name
json.published terrain_profile.published?
json.ownership(
  if terrain_profile.owned_by?(current_user) then 'own'
  elsif terrain_profile.shared_with?(current_user) then 'shared_with_me'
  elsif terrain_profile.shared? then 'community'
  else 'published'
  end
)
json.editable terrain_profile.editable?(current_user)
json.removable terrain_profile.removable_by?(current_user)

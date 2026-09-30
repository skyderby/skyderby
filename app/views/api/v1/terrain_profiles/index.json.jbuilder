json.key_format! camelize: :lower

json.items @terrain_profiles do |terrain_profile|
  json.partial! 'api/v1/terrain_profiles/terrain_profile', terrain_profile:
end
json.current_page @terrain_profiles.current_page
json.total_pages @terrain_profiles.total_pages
json.creatable TerrainProfile.creatable?(current_user)
json.shareable TerrainProfile.shareable_by?(current_user)

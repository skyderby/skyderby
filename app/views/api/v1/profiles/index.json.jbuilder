json.key_format! camelize: :lower

json.items @profiles do |profile|
  json.extract! profile, :id, :name
  json.country_code profile.country&.code
  json.contributor profile.contributor?
  json.has_account profile.belongs_to_user?
  json.pro profile.belongs_to_user? && profile.owner&.subscribed?
  json.photo { json.partial! 'api/v1/profiles/photo', profile: }
  json.tracks_count do
    json.skydive profile.skydive_count
    json.base profile.base_count
    json.speed_skydiving profile.speed_skydiving_count
  end
end

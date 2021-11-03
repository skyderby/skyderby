json.key_format! camelize: :lower

user = Current.user
profile = Current.profile

json.authorized true
json.user_id user.id
json.email user.email
json.profile_id profile.id
json.name profile.name
json.country_id profile.country_id

json.photo do |json|
  json.original profile.userpic_url
  json.medium profile.userpic_url(:medium)
  json.thumb profile.userpic_url(:thumb)
end

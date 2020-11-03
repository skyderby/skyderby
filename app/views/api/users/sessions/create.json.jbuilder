json.key_format! camelize: :lower

user = Current.user
profile = Current.profile

json.new_csrf_token form_authenticity_token

json.authorized true
json.user_id user.id
json.email user.email
json.profile_id profile.id
json.name profile.name
json.country_id profile.country_id

json.photo do |json|
  json.original profile.userpic.url
  json.medium profile.userpic.url(:medium)
  json.thumb profile.userpic.url(:thumb)
end

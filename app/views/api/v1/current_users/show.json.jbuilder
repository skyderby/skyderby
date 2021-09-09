json.key_format! camelize: :lower

if @user.registered?
  json.authorized @user.present?

  json.user_id @user.id
  json.email @user.email
  json.profile_id @profile.id
  json.name @profile.name
  json.country_id @profile.country_id

  json.photo do |json|
    json.original @profile.userpic.url
    json.medium @profile.userpic.url(:medium)
    json.thumb @profile.userpic.url(:thumb)
  end
else
  json.authorized false
end

json.permissions do
  json.can_create_place policy(Place).create?
end

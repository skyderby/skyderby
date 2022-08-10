json.key_format! camelize: :lower

if @user.registered?
  json.authorized @user.present?

  json.user_id @user.id
  json.email @user.email
  json.profile_id @profile.id
  json.name @profile.name
  json.country_id @profile.country_id

  json.photo do |json|
    json.original @profile.userpic_url
    json.medium @profile.userpic_url(:medium)
    json.thumb @profile.userpic_url(:thumb)
  end
else
  json.authorized false
end

json.permissions do
  json.can_access_admin_panel @user.has_role?(:admin)
  json.can_create_place policy(Place).create?
  json.can_manage_users policy(User).index?
end

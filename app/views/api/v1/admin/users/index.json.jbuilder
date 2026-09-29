json.key_format! camelize: :lower

json.items @users do |user|
  json.extract! user, :id, :email
  if user.profile
    json.profile { json.partial! 'api/v1/admin/users/profile', profile: user.profile }
  else
    json.profile nil
  end
end

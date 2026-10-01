json.key_format! camelize: :lower

json.items @users do |user|
  json.id user.id
  json.name user.profile&.name
  json.photo { json.partial! 'api/v1/profiles/photo', profile: user.profile } if user.profile
end

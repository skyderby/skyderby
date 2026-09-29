json.key_format! camelize: :lower

if @profile
  json.extract! @profile, :id, :name
  json.photo { json.partial! 'api/v1/profiles/photo', profile: @profile }
end

json.user do
  json.extract! @user, :id, :email
  json.admin @user.admin?
end

if @profile
  json.profile do
    json.extract! @profile, :id, :name, :country_id
    json.photo { json.partial! 'api/v1/profiles/photo', profile: @profile }
  end
else
  json.profile nil
end

json.subscription { json.partial! 'api/v1/shared/subscription', subscription: @user.subscription }
json.free_pro_views { json.partial! 'api/v1/shared/free_pro_views', user: @user }

if impersonation
  json.impersonated_by do
    json.id impersonation.admin_user_id
    json.name impersonation.admin_user.name
    json.expires_at impersonation.expires_at&.iso8601
  end
end

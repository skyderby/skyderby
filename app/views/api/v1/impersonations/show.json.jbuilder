json.key_format! camelize: :lower

json.access_token @impersonation.access_token.plaintext_token
json.expires_at @impersonation.expires_at.iso8601

json.user do
  json.extract! @impersonation.user, :id, :email
end

if @profile
  json.profile { json.partial! 'api/v1/admin/users/profile', profile: @profile }
else
  json.profile nil
end

json.id gift.id
json.created_at gift.created_at.iso8601
json.message gift.reason
json.recipient do
  if (profile = gift.user.profile)
    json.id profile.id
    json.name profile.name
    json.photo { json.partial! 'api/v1/profiles/photo', profile: }
  else
    json.id nil
    json.name nil
  end
end

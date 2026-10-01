json.user_id share.user_id
json.name share.user.profile&.name
json.photo { json.partial! 'api/v1/profiles/photo', profile: share.user.profile } if share.user.profile

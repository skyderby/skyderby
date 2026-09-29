json.id profile.id
json.name profile.name
json.country_code profile.country_code
json.country_name profile.country_name
json.gender profile.gender
json.contributor profile.contributor?
json.photo { json.partial! 'api/v1/profiles/photo', profile: }

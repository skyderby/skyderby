json.extract! profile, :id, :name, :country_code
json.photo { json.partial! 'api/v1/profiles/photo', profile: }

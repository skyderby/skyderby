json.extract! competitor, :id, :profile_id, :suit_id
json.profile do
  json.partial! 'api/v1/profiles/profile', profile: competitor.profile
  json.country do
    if competitor.profile.country
      json.partial! 'api/v1/countries/country', country: competitor.profile.country
    else
      json.null!
    end
  end
end

json.suit do
  json.partial! 'api/v1/suits/suit', suit: competitor.suit
  json.manufacturer do
    json.partial! 'api/v1/manufacturers/manufacturer', manufacturer: competitor.suit.manufacturer
  end
end

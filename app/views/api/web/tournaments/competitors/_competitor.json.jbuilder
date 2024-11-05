json.extract! competitor, :id, :profile_id, :suit_id
json.profile do
  json.partial! 'api/web/profiles/profile', profile: competitor.profile
  json.country do
    if competitor.profile.country
      json.partial! 'api/web/countries/country', country: competitor.profile.country
    else
      json.null!
    end
  end
end

json.suit do
  json.partial! 'api/web/suits/suit', suit: competitor.suit
  json.manufacturer do
    json.partial! 'api/web/manufacturers/manufacturer', manufacturer: competitor.suit.manufacturer
  end
end

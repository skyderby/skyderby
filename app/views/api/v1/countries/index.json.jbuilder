json.key_format! camelize: :lower

json.items @countries do |country|
  json.partial! 'country', country: country
end

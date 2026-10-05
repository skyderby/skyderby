json.key_format! camelize: :lower

json.items @identities do |identity|
  json.partial! 'api/v1/identities/identity', identity:
end

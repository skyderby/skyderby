json.key_format! camelize: :lower

json.array! @suits do |suit|
  json.partial! 'api/v1/suits/suit', suit: suit
  json.popularity suit.popularity.to_f
end

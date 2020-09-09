json.key_format! camelize: :lower

json.extract! @suits, :current_page, :total_pages

json.items @suits do |suit|
  json.partial! 'suit', suit: suit
end

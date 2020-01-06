json.key_format! camelize: :lower

json.extract! @suits, :current_page, :total_pages

json.items @suits do |suit|
  json.extract! suit, :id, :name, :make, :make_code
  json.category suit.kind
end

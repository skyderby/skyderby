json.array! @suits do |suit|
  json.extract! suit, :id, :name, :make, :make_code
  json.category suit.kind
end

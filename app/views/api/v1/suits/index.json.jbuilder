json.array! @suits do |suit|
  json.make suit.make
  json.make_code suit.make_code
  json.name suit.name
  json.category suit.kind
end

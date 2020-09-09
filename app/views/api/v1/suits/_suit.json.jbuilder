json.key_format! camelize: :lower

json.extract! suit, :id, :name
json.make_id suit.manufacturer_id
json.category suit.kind
json.editable policy(suit).edit?

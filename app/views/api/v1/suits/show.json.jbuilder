json.key_format! camelize: :lower

json.extract! @suit, :id, :name
json.make @suit.manufacturer_name
json.make_code @suit.manufacturer_code

json.key_format! camelize: :lower

json.gift { json.partial! 'api/v1/gifts/gift', gift: @gift }

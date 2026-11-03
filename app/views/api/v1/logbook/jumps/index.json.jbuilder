json.key_format! camelize: :lower

json.items @changes.items, partial: 'api/v1/logbook/jumps/jump', as: :jump
json.cursor @changes.cursor.encode
json.has_more @changes.more?

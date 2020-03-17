json.key_format! camelize: :lower

json.extract! @country, :id, :name, :code

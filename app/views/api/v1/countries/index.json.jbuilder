json.key_format! camelize: :lower

json.items @countries, partial: 'country', as: :country

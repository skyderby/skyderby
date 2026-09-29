json.key_format! camelize: :lower

json.partial! 'api/v1/sync/manufacturer', manufacturer: @manufacturer
json.suits @manufacturer.suits.order(:name), partial: 'api/v1/sync/suit', as: :suit

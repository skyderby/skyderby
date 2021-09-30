json.key_format! camelize: :lower

json.extract! @suits, :current_page, :total_pages

json.items @suits, partial: 'suit', as: :suit

json.relations do
  manufacturers = @suits.map(&:manufacturer)
  json.manufacturers manufacturers, partial: 'api/v1/manufacturers/manufacturer', as: :manufacturer
end

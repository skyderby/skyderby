json.extract! @suits, :current_page, :total_pages

json.items @suits, partial: 'suit', as: :suit

json.relations do
  manufacturers = @suits.map(&:manufacturer)
  json.manufacturers manufacturers, partial: 'api/web/manufacturers/manufacturer', as: :manufacturer
end

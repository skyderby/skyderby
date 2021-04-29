json.key_format! camelize: :lower

json.extract! @suits, :current_page, :total_pages

json.items @suits, partial: 'suit', as: :suit

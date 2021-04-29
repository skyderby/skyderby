json.key_format! camelize: :lower

json.extract! @manufacturers, :current_page, :total_pages

json.items @manufacturers, partial: 'manufacturer', as: :manufacturer

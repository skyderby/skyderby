json.extract! @manufacturers, :current_page, :total_pages

json.items @manufacturers, partial: 'manufacturer', as: :manufacturer

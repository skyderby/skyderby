json.key_format! camelize: :lower

json.extract! @places, :current_page, :total_pages

json.items @places do |place|
  json.extract! place, :id, :name, :country_code
end

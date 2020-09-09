json.key_format! camelize: :lower

json.extract! @manufacturers, :current_page, :total_pages

json.items @manufacturers do |manufacturer|
  json.partial! 'manufacturer', manufacturer: manufacturer
end

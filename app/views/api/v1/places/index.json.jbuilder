json.key_format! camelize: :lower

json.extract! @places, :current_page, :total_pages

json.items @places do |place|
  json.partial! 'place', place: place
end

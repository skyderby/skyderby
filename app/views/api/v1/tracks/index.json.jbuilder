json.key_format! camelize: :lower

json.extract! @tracks, :current_page, :total_pages

json.items @tracks do |track|
  json.extract! \
    track,
    :id,
    :profile_id,
    :suit_id,
    :place_id,
    :name,
    :comment

  json.pilot_name track.pilot&.name || track.name
  json.manufacturer_code track.suit&.manufacturer_code
  json.suit_name track.suit_name || track.missing_suit_name
  json.country_code track.place&.country_code
  json.place_name track.place_name || track.location
  json.distance track.distance&.result.to_i
  json.speed track.speed&.result.to_i
  json.time track.time&.result.to_f.round(1)
  json.recorded_at track.recorded_at.strftime('%d.%m.%Y')
end

json.array! @tracks do |track|
  json.id track.id
  json.name track.name
  json.suit track.suit ? track.suit.name : track.suit
  json.kind track.kind
  json.location track.location
  json.comment track.comment
  json.created_at track.created_at.strftime('%d.%m.%Y')
  json.url track_path(track.id)
  json.presentation track.presentation
end

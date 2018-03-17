json.results @tracks do |track|
  json.id track.id
  json.text track_presentation(track)
end

json.pagination do |json|
  json.more @tracks.next_page ? true : false
end

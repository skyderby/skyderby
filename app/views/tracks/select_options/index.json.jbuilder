json.results @tracks do |track|
  json.id track.id
  json.text "##{track.id} | #{track.recorded_at&.strftime('%Y-%m-%d')} | #{track.comment}"
end

json.pagination do |json|
  json.more @tracks.next_page ? true : false
end

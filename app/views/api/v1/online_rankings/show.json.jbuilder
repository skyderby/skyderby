json.data do
  json.partial! 'online_ranking', online_ranking: @online_ranking
end

json.relations do
  json.places [@online_ranking.place].compact, partial: 'api/v1/places/place', as: :place, without_photos: true
  json.groups [@online_ranking.group], partial: 'api/v1/online_rankings/groups/group', as: :group
end

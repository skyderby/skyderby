json.data do
  json.partial! 'online_ranking', online_ranking: @online_ranking
end

json.relations do
  json.places [@online_ranking.place].compact, partial: 'api/web/places/place', as: :place, without_photos: true
  json.groups [@online_ranking.group], partial: 'api/web/online_rankings/groups/group', as: :group
end

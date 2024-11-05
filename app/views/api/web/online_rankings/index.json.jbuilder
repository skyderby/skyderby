json.data @online_rankings, partial: 'online_ranking', as: :online_ranking

json.relations do
  groups = @online_rankings.map(&:group).compact.uniq
  json.groups groups, partial: 'api/web/online_rankings/groups/group', as: :group

  places = @online_rankings.map(&:place).compact.uniq
  json.places places, partial: 'api/web/places/place', as: :place, without_photos: true

  countries = places.map(&:country).compact.uniq
  json.countries countries, partial: 'api/web/countries/country', as: :country
end

json.permissions do
  json.can_create policy(VirtualCompetition).create?
end

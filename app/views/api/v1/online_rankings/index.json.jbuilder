json.items @online_rankings do |ranking|
  json.extract! ranking,
                :period_from,
                :period_to,
                :discipline,
                :discipline_parameter,
                :name,
                :group_id,
                :place_id,
                :finish_line_id,
                :suits_kind,
                :jumps_kind,
                :range_from,
                :range_to,
                :display_highest_speed,
                :display_highest_gr,
                :display_on_start_page,
                :default_view

  json.created_at ranking.created_at.iso8601
  json.updated_at ranking.updated_at.iso8601
end

json.relations do
  groups = @online_rankings.map(&:group).compact.uniq
  json.groups groups, partial: 'api/v1/online_rankings/groups/group', as: :group

  places = @online_rankings.map(&:place).compact.uniq
  json.places places, partial: 'api/v1/places/place', as: :place, without_photos: true

  countries = places.map(&:country).compact.uniq
  json.countries countries, partial: 'api/v1/countries/country', as: :country
end

json.permissions do
  json.can_create policy(VirtualCompetition).create?
end

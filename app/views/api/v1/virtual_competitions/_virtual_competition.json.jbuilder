json.online_competition do
  json.extract! virtual_competition,
                :id,
                :name,
                :discipline,
                :range_from,
                :range_to,
                :discipline_parameter,
                :period_from,
                :period_to,
                :jumps_kind,
                :suits_kind,
                :display_highest_gr,
                :display_highest_speed

  json.units competition_unit(virtual_competition)

  json.group do |json|
    json.extract! virtual_competition.group, :id, :name
  end
end

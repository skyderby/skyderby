json.extract! competition, 
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

json.group do |json|
  json.extract! competition.group, :id, :name
end

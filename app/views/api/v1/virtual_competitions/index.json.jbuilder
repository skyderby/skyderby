json.online_competitions do |json|
  json.array! @competitions, partial: 'api/v1/virtual_competitions/virtual_competition', as: :competition
end

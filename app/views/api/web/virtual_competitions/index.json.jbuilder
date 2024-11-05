json.online_competitions @competitions do |json, competition|
  json.partial! competition, partial: 'api/web/virtual_competitions/virtual_competition', as: :competition
end

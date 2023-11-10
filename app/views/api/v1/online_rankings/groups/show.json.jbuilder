json.partial! 'group', group: @group
json.relations do
  json.online_rankings @group.virtual_competitions, partial: 'api/v1/online_rankings/online_ranking', as: :online_ranking
end

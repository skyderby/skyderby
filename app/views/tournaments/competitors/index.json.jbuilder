json.array!(@tournament_competitors) do |tournament_competitor|
  json.extract! tournament_competitor, :id, :tournament_id, :user_profile_id, :wingsuit_id
  json.url tournament_competitor_url(tournament_competitor, format: :json)
end

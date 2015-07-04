json.array!(@tournament_match_competitors) do |tournament_match_competitor|
  json.extract! tournament_match_competitor, :id, :tournament_match_id, :tournament_competitor_id, :result, :track_id
  json.url tournament_match_competitor_url(tournament_match_competitor, format: :json)
end

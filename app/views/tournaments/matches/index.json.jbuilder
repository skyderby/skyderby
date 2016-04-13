json.array!(@tournament_matches) do |tournament_match|
  json.extract! tournament_match, :id, :tournament_round_id
  json.url tournament_match_url(tournament_match, format: :json)
end

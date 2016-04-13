json.array!(@tournament_rounds) do |tournament_round|
  json.extract! tournament_round, :id, :order
  json.url tournament_round_url(tournament_round, format: :json)
end

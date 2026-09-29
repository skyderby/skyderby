competition = ranking.competition

json.rank score.rank
if ranking.show_rank_changes?
  json.rank_change do
    json.partial! 'api/v1/virtual_competitions/rank_change', change: ranking.rank_change_for(score)
  end
else
  json.rank_change nil
end
json.result score.result
json.result_formatted format_result(score.result, competition).to_s
json.highest_speed score.highest_speed
json.highest_gr score.highest_gr
json.recorded_at score.recorded_at&.utc&.iso8601
json.focused score.profile_id == focused_profile_id
json.profile { json.partial! 'api/v1/virtual_competitions/profile', profile: score.profile }
if score.suit
  json.suit { json.partial! 'api/v1/virtual_competitions/suit', suit: score.suit }
else
  json.suit nil
end
json.track { json.partial! 'api/v1/virtual_competitions/track', track: score.track }

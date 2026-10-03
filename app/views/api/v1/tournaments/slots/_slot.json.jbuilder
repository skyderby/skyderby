json.id slot.id
json.competitor_id slot.competitor_id
json.track_id slot.track_id
json.result api_float(slot.result, 3)
json.is_winner slot.is_winner || false
json.is_disqualified slot.is_disqualified || false
json.is_lucky_looser slot.is_lucky_looser || false
json.earn_medal slot.earn_medal
json.notes slot.notes

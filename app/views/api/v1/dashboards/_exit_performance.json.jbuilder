json.id performance.id
json.label exit_performance_suit_name(performance)
json.suit { json.partial! 'api/v1/virtual_competitions/suit', suit: performance.suit }
json.tracks_count performance.tracks_count
json.reliable performance.reliable?
json.samples performance.samples do |sample|
  %w[drop low q1 mid q3 high flat].each { |key| json.set! key, sample[key]&.to_f }
end

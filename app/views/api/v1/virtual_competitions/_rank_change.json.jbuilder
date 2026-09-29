json.status(
  if change.nil? then 'new'
  elsif change.positive? then 'up'
  elsif change.negative? then 'down'
  else 'same'
  end
)
json.delta change

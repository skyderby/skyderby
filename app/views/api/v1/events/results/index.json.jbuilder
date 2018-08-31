json.array! @results do |result|
  json.partial! 'result', result: result
end

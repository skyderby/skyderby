track = @track_data.track
json.cache! track do
  json.extract! track, :id
  json.points @track_data.points
end

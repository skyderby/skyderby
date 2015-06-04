track = @track_data.track
json.extract! track, :id
json.points @track_data.points

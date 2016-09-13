class TrackResultsService
  attr_reader :track

  def initialize(trk)
    @track = trk
  end

  def execute
    track.delete_results  
    
    track_segments = ranges_to_score.map do |range|
      WindowRangeFinder.new(track_points)
                     .execute(from_altitude: range[:start_altitude],
                              to_altitude:   range[:end_altitude])
    end

    [:speed, :distance, :time].each do |task|
      best_task_result = track_segments.max_by { |x| x.public_send(task) }
      track.track_results.create!(discipline: task,
                                 range_from: best_task_result.start_altitude,
                                 range_to:   best_task_result.end_altitude,
                                 result:     best_task_result.public_send(task))
    end
  end

  private

  def track_points
    @track_points ||=
      track.points.trimmed.pluck_to_hash(
        'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time',
        "#{@track.point_altitude_field} AS altitude",
        :latitude,
        :longitude)
  end

  def ranges_to_score
    activity = @track.kind.to_sym
    altitude_bounds = @track.altitude_bounds

    RangesToScoreFinder.new(altitude_bounds, activity).calculate
  end
end

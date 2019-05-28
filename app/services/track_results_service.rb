class TrackResultsService
  attr_reader :track

  def initialize(track)
    @track = track
  end

  def execute
    track.delete_results

    track_segments = ranges_to_score.map do |range|
      WindowRangeFinder.new(track_points).execute \
        from_altitude: range[:start_altitude],
        to_altitude: range[:end_altitude]
    end

    return if track_segments.blank?

    [:speed, :distance, :time].each do |task|
      best_task_result = track_segments.max_by { |x| x.public_send(task) }

      track.track_results.create! \
        discipline: task,
        range_from: best_task_result.start_altitude,
        range_to: best_task_result.end_altitude,
        result: best_task_result.public_send(task)
    end
  end

  private

  def track_points
    @track_points ||= PointsQuery.execute track,
                                          trimmed: true,
                                          only: %i[gps_time altitude latitude longitude]
  end

  def ranges_to_score
    activity = @track.kind.to_sym
    altitude_bounds = @track.altitude_bounds

    RangesToScoreFinder.for(activity).new(altitude_bounds).calculate
  end
end

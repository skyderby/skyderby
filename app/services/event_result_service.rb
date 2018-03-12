class EventResultService
  def initialize(track, round, wind_cancellation: false)
    @track = track
    @event = round.event
    @task = round.discipline.to_sym
    @wind_cancellation = wind_cancellation
  end

  def calculate
    points = track_points
    points = subtract_wind(points) if @wind_cancellation

    track_segment = WindowRangeFinder.new(points).execute(
      from_altitude: @event.range_from,
      to_altitude: @event.range_to)

    track_segment.public_send(@task)
  rescue WindowRangeFinder::ValueOutOfRange
    return 0
  end

  private

  def subtract_wind(points)
    wind_data = WindCancellation::WindData.new(@event.weather_data)
    points = WindCancellation::WindSubtraction.new(points, wind_data).execute
  end

  def track_points
    @track.points.trimmed.pluck_to_hash(
      'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time',
      "#{@track.point_altitude_field} AS altitude",
      :latitude,
      :longitude
    )
  end
end

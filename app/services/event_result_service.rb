class EventResultService
  def initialize(track, round, wind_cancellation: false)
    @track = track
    @event = round.event
    @task = round.discipline.to_sym
    @wind_cancellation = wind_cancellation
  end

  def calculate
    return flare if @task == :flare

    points =
      if wind_cancellation
        subtract_wind(track_points)
      else
        track_points
      end

    track_segment = WindowRangeFinder.new(points).execute(
      from_altitude: @event.range_from,
      to_altitude: @event.range_to
    )

    track_segment.public_send(@task)
  rescue WindowRangeFinder::ValueOutOfRange
    0
  end

  private

  attr_reader :track, :wind_cancellation

  def flare
    flares = Tracks::FlaresDetector.call(track_points)
    return 0 unless flares.any?

    flares.max_by(&:altitude_gain).altitude_gain
  end

  def subtract_wind(points)
    start_time = points.first[:gps_time].beginning_of_hour
    weather_data = @event.place.weather_data.for_time(start_time)

    wind_data = WindCancellation::WindData.new(weather_data)
    WindCancellation::WindSubtraction.new(points, wind_data).execute
  end

  def track_points
    @track_points ||= PointsQuery.execute(
      track,
      trimmed: true,
      only: %i[gps_time time_diff altitude latitude longitude v_speed]
    )
  end
end

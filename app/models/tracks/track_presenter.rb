class Tracks::TrackPresenter < Tracks::BasePresenter
  def initialize(track, range_from = nil, range_to = nil, speed_units, distance_units, altitude_units)
    @track = track

    @range_from = convert_from_string(range_from)
    @range_from = altitude_bounds[:max_altitude] if @range_from.nil? || @range_from > altitude_bounds[:max_altitude]

    @range_to = convert_from_string(range_to)
    @range_to = altitude_bounds[:min_altitude] if @range_to.nil? || @range_to < altitude_bounds[:min_altitude] || @range_to > @range_from

    super(track, @range_from, @range_to, speed_units, distance_units, altitude_units)
  end

  def distance
    distance_presentation(track_distance)
  end

  def min_altitude
    altitude_presentation(altitude_bounds[:min_altitude])
  end

  def max_altitude
    altitude_presentation(altitude_bounds[:max_altitude])
  end

  def range_from
    altitude_presentation(@range_from)
  end

  def range_to
    altitude_presentation(@range_to)
  end

  private

  def convert_from_string(value)
    if value.nil?
      nil
    elsif value.class == String && value.empty?
      nil
    else
      value.to_f
    end
  end

  def track_distance
    track_trajectory_distance
  end

  def altitude_bounds
    @altitude_bounds ||= begin
      points_altitude = @track.points.freq_1Hz.trimmed.pluck("#{@track.point_altitude_field}")
      { 
        max_altitude: points_altitude.max,
        min_altitude: points_altitude.min
      }
    end
  end
end

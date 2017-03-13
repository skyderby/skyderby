class Tracks::TrackPresenter < Tracks::BasePresenter
  attr_reader :track

  def initialize(trk, range_from = nil, range_to = nil, speed_units, distance_units, altitude_units)
    @track = trk

    @range_from = convert_from_string(range_from)
    @range_from = track.altitude_bounds[:max_altitude] if @range_from.nil? || @range_from > track.altitude_bounds[:max_altitude]

    @range_to = convert_from_string(range_to)
    @range_to = track.altitude_bounds[:min_altitude] if @range_to.nil? || @range_to < track.altitude_bounds[:min_altitude] || @range_to > @range_from

    super(track, @range_from, @range_to, speed_units, distance_units, altitude_units)
  end

  def min_altitude
    altitude_presentation(track.altitude_bounds[:min_altitude])
  end

  def max_altitude
    altitude_presentation(track.altitude_bounds[:max_altitude])
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
end

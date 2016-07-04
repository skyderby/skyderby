class Events::Rounds::Map

  class CompetitorTrack < SimpleDelegator
    attr_accessor :start_point, :end_point, :path_coordinates, :direction, :color
  end

  attr_reader :competitors

  COLORS = [
    '#7cb5ec',
    '#434348', 
    '#90ed7d', 
    '#f7a35c', 
    '#8085e9', 
    '#f15c80', 
    '#e4d354', 
    '#8085e8', 
    '#8d4653', 
    '#91e8e1'
  ]

  def initialize(round)
    @round = round
    @competitors = {}
    @color_index = 0
  end

  def build
    @round.event_tracks.each do |event_track|
      @competitors[event_track.competitor_id] = competitor_track(event_track)
    end

    self
  end

  def to_json
    @competitors.map do |_, v| 
      {
        path_coordinates: v.path_coordinates,
        start_point: v.start_point,
        end_point: v.end_point,
        color: v.color
      }
    end.to_json.html_safe
  end

  private

  def competitor_track(event_track)
    competitor_info = CompetitorTrack.new(event_track.competitor)
    points = track_points(event_track.track)
    competitor_info.path_coordinates = path_coordinates(points)
    competitor_info.start_point = find_point_near_altitude(points, @round.range_from)
    competitor_info.end_point = find_point_near_altitude(points, @round.range_to)
    competitor_info.direction =
      Skyderby::Geospatial.bearing_between(competitor_info.start_point[:lat],
                                           competitor_info.start_point[:lng],
                                           competitor_info.end_point[:lat],
                                           competitor_info.end_point[:lng])
    competitor_info.color = color
    competitor_info
  end

  def path_coordinates(points)
    points.map { |x| {lat: x[:latitude].to_f, lng: x[:longitude].to_f} }
  end

  def find_point_near_altitude(points, altitude)
    pair =
      points.each_cons(2).detect do |pair|
        altitude.between? pair.last[:altitude], pair.first[:altitude]
      end

    return nil unless pair

    {
      lat: interpolate(pair, :latitude, :altitude, altitude).to_f,
      lng: interpolate(pair, :longitude, :altitude, altitude).to_f
    }
  end

  def interpolate(pair, field, key_field, key_value)
    coeff = (pair.first[key_field] - key_value) / (pair.first[key_field] - pair.last[key_field])
    pair.first[field] + (pair.last[field] - pair.first[field]) * coeff
  end

  def color
    @color_index += 1
    COLORS[@color_index]
  end

  def track_points(track)
    track.points
         .freq_1Hz
         .trimmed
         .where("#{track.point_altitude_field} > 1200")
         .pluck_to_hash(
           '(to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\') gps_time',
           "#{track.point_altitude_field} AS altitude",
           :latitude,
           :longitude
         )
  end
end

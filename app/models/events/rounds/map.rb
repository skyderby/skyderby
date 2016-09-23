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
        id: v.id,
        name: v.name.titleize,
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
    track_segment = WindowRangeFinder.new(points).execute(
      from_altitude: @round.range_from,
      to_altitude: @round.range_to) 
    competitor_info.start_point = map_marker(track_segment.start_point)
    competitor_info.end_point = map_marker(track_segment.end_point)
    competitor_info.direction = track_segment.direction
    competitor_info.color = color
    competitor_info
  end

  def path_coordinates(points)
    points.map { |point| map_marker(point) }
  end

  def map_marker(point)
    { lat: point[:latitude].to_f, lng: point[:longitude].to_f }
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
           '(to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\') AS gps_time',
           "#{track.point_altitude_field} AS altitude",
           :latitude,
           :longitude)
  end
end

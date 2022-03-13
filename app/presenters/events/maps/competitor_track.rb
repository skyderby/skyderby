class Events::Maps::CompetitorTrack < SimpleDelegator
  attr_accessor :color

  delegate :name, to: :competitor
  delegate :direction, to: :window_points
  delegate :designated_lane_start, to: :event

  def empty? = points.blank?

  def present? = !empty?

  def start_time
    return track.recorded_at if points.blank?

    points.first[:gps_time]
  end

  def path_coordinates = points.map { |point| map_marker(point) }

  def start_point = map_marker(window_points.start_point)

  def end_point = map_marker(window_points.end_point)

  def after_exit_point = map_marker(ten_seconds_after_exit_point)

  def reference_point
    assigned_point = super
    return unless assigned_point

    map_marker(assigned_point)
  end

  private

  def map_marker(point)
    { lat: point[:latitude].to_f, lng: point[:longitude].to_f, gpsTime: point[:gps_time]&.iso8601(3) }
  end

  def ten_seconds_after_exit_point
    time_for_lookup = exited_at + 10.seconds
    points.find(-> { points.first }) { |point| point[:gps_time] > time_for_lookup }
  end
end

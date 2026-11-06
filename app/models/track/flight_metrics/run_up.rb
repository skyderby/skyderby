require 'vincenty'

class Track::FlightMetrics::RunUp
  ENTRY_SECONDS = 5
  SETTLED_SHARE = 0.1

  def initialize(points, start)
    @points = points
    @start = start
  end

  def samples
    @samples ||= lead_points.map do |point|
      {
        time: (point[:gps_time] - start[:gps_time]).to_f,
        lost: start[:altitude] - point[:altitude],
        distance: -Vincenty.distance_between_points(start, point),
        h_speed: point[:h_speed],
        v_speed: point[:v_speed]
      }
    end
  end

  def to_h
    return {} if samples.size < 2

    first = samples.first
    { 'duration' => -first[:time].round(1), 'height' => -first[:lost].round, **entry_changes, **top_speed,
      'settled_for' => settled_for.round(1) }
  end

  private

  attr_reader :points, :start

  def lead_points
    exit = points.index { |point| point[:v_speed] >= Track::FlightMetrics::START_VERTICAL_SPEED }
    return [] unless exit

    points.drop(exit).take_while { |point| point[:gps_time] < start[:gps_time] }
  end

  def entry_changes
    before = samples.min_by { |sample| (sample[:time] + ENTRY_SECONDS).abs }
    { 'entry_v_speed_change' => (start[:v_speed] - before[:v_speed]).round,
      'entry_h_speed_change' => (start[:h_speed] - before[:h_speed]).round }
  end

  def top_speed
    entry = total(start)
    top = [samples.map { |sample| total(sample) }.max, entry].max
    energy = Track::FlightMetrics::Segments.method(:energy)
    { 'top_speed' => top.round, 'entry_total_speed' => entry.round, 'speed_from_top' => (entry - top).round,
      'energy_from_top' => (energy.call(entry) - energy.call(top)).round }
  end

  def total(point) = Math.hypot(point[:h_speed], point[:v_speed])

  def settled_for
    limit = start[:v_speed].abs * SETTLED_SHARE
    settled = samples.reverse.take_while { |sample| (sample[:v_speed] - start[:v_speed]).abs <= limit }
    settled.any? ? -settled.last[:time] : 0
  end
end

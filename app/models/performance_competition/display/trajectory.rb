class PerformanceCompetition::Display
  class Trajectory
    include SideViewTrajectory

    LEAD_IN = 5 # seconds of flight shown before the window opens

    def initialize(result)
      @result = result
    end

    # Points carry, per moment: t (window-relative time, negative before entry),
    # x (cumulative horizontal path for the side view), d (straight-line
    # horizontal distance from the window entry — the basis for the running
    # distance/speed result), alt, and h/v speed.
    def points
      window, start_time, entry = window_with_lead_in
      return [] if window.size < 2

      distance = 0.0
      previous = nil

      raw = window.map do |point|
        distance += horizontal_step(previous, point) if previous
        previous = point

        {
          t: point[:fl_time] - start_time,
          x: distance,
          d: horizontal_step(entry, point),
          alt: point[:altitude],
          hs: point[:h_speed] || 0,
          vs: point[:v_speed] || 0
        }
      end

      round_points(zero_x_at_entry(raw))
    end

    private

    attr_reader :result

    # Zero x at the window entry (t = 0) so every compared track crosses the
    # window at the same horizontal position on the side view.
    def zero_x_at_entry(points)
      entry_x = (points.find { |point| point[:t] >= 0 } || points.first)[:x]
      points.each { |point| point[:x] -= entry_x }
    end

    def window_with_lead_in
      full = track_points
      segment = window_segment(full)
      return [[], nil, nil] if segment.nil? || segment.size < 2

      start_time = segment.first[:fl_time]
      lead_in = full.select { |point| point[:fl_time] >= start_time - LEAD_IN && point[:fl_time] < start_time }
      [lead_in + segment, start_time, segment.first]
    end

    def track_points
      PointsQuery.execute(
        result.track,
        trimmed: { seconds_before_start: LEAD_IN + 5 },
        only: %i[fl_time altitude latitude longitude h_speed v_speed]
      )
    end

    def window_segment(points)
      WindowRangeFinder
        .new(points)
        .execute(from_altitude: result.round.range_from, to_altitude: result.round.range_to)
        .points
    rescue WindowRangeFinder::ValueOutOfRange
      nil
    end

    def round_points(points)
      points.map do |point|
        {
          t: point[:t].round(3),
          x: point[:x].round(1),
          d: point[:d].round(1),
          alt: point[:alt].round(1),
          hs: point[:hs].round(1),
          vs: point[:vs].round(1)
        }
      end
    end
  end
end

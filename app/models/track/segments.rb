class Track
  class Segments
    MIN_JUMP_DESCENT = 35
    PEAK_SUSTAIN = 3
    FREEFALL_FRACTION = 0.5
    FREEFALL_FLOOR = 30
    MIN_FREEFALL_DURATION = 3
    FREEFALL_CONFIRM_WINDOW = 40

    EXIT_BASELINE_WINDOW = 20
    EXIT_BASELINE_PERCENTILE = 0.25
    EXIT_DEPARTURE_MARGIN = 8
    MAX_EXIT_LOOKBACK = 30
    RECORDING_GAP = 10

    FLIGHT_SPEED = 95
    FLIGHT_DESCENT = 20
    DEPLOY_OPENING_TIME = 4
    DEPLOY_COLLAPSE_WINDOW = 15
    DEPLOY_DROP_SPAN = 4
    DEPLOY_LATE_MARGIN = 5

    GROUND_HORIZONTAL_SPEED = 15
    GROUND_VERTICAL_SPEED = 10
    MIN_LANDING_DURATION = 20
    MIN_TRAILING_LANDING_DURATION = 3

    SMOOTHING_WINDOW = 3

    def initialize(points)
      @points = points
    end

    def exit_point
      jump? ? points[exit_index] : points.first
    end

    def deploy_point
      jump? ? points[deploy_index] : points.last
    end

    def landing_point
      points[landing_index] if jump? && landing_index
    end

    def require_review?
      !jump?
    end

    private

    attr_reader :points

    def jump?
      exit_index && deploy_index
    end

    def freefall_start
      return @freefall_start if defined?(@freefall_start)

      @freefall_start = points.each_index.find do |index|
        vertical_speed[index] > FREEFALL_FLOOR && freefall_begins_at?(index)
      end
    end

    def freefall_begins_at?(index)
      return false if peak_descent < MIN_JUMP_DESCENT

      falling_since = nil
      index.upto(points.size - 1) do |i|
        break if times[i] - times[index] > FREEFALL_CONFIRM_WINDOW

        if vertical_speed[i] > freefall_speed
          falling_since ||= i
          return true if times[i] - times[falling_since] >= MIN_FREEFALL_DURATION
        else
          falling_since = nil
        end
      end
      false
    end

    def freefall_speed
      FREEFALL_FRACTION * peak_descent
    end

    def peak_descent
      return @peak_descent if defined?(@peak_descent)

      raw = points.map(&:v_speed)
      high = 0
      @peak_descent = points.each_index.map do |i|
        high = i if high < i
        high += 1 while high + 1 < points.size && times[high + 1] - times[i] <= PEAK_SUSTAIN
        raw[i..high].min
      end.max
    end

    def exit_index
      return @exit_index if defined?(@exit_index)
      return @exit_index = nil unless freefall_start

      index = freefall_start
      index -= 1 while still_falling_before?(index)
      @exit_index = index
    end

    def still_falling_before?(index)
      index.positive? &&
        vertical_speed[index - 1] >= departure_speed &&
        times[index] - times[index - 1] < RECORDING_GAP &&
        times[freefall_start] - times[index - 1] <= MAX_EXIT_LOOKBACK
    end

    def departure_speed
      @departure_speed ||= baseline_vertical_speed + EXIT_DEPARTURE_MARGIN
    end

    def baseline_vertical_speed
      from = index_at(times[freefall_start] - EXIT_BASELINE_WINDOW)
      window = vertical_speed[from..freefall_start].sort
      [0.0, window[(EXIT_BASELINE_PERCENTILE * (window.size - 1)).round]].max
    end

    def deploy_index
      return @deploy_index if defined?(@deploy_index)
      return @deploy_index = nil unless exit_index

      opening = index_at(points[flight_end].fl_time + DEPLOY_OPENING_TIME)
      collapse = airspeed_collapse_after(flight_end)
      @deploy_index =
        if (times[collapse] - times[opening]).abs > DEPLOY_LATE_MARGIN
          collapse
        else
          opening
        end
    end

    def flight_end
      return @flight_end if defined?(@flight_end)

      score = 0
      best_score = nil
      @flight_end = exit_index

      (exit_index...points.size).each do |index|
        score += flying?(index) ? 1 : -1
        if best_score.nil? || score > best_score
          best_score = score
          @flight_end = index
        end
      end

      @flight_end
    end

    def flying?(index)
      air_speed[index] > FLIGHT_SPEED && vertical_speed[index] > FLIGHT_DESCENT
    end

    def airspeed_collapse_after(from)
      last = index_at(times[from] + DEPLOY_COLLAPSE_WINDOW)
      (from..last).max_by { |index| airspeed_drop_at(index) }
    end

    def airspeed_drop_at(index)
      before = air_speed[index_at(times[index] - DEPLOY_DROP_SPAN)..index]
      after = air_speed[index..index_at(times[index] + DEPLOY_DROP_SPAN)]
      median(before) - median(after)
    end

    def landing_index
      return @landing_index if defined?(@landing_index)
      return @landing_index = nil unless deploy_index

      @landing_index = nil
      stopped_since = nil

      (deploy_index...points.size).each do |index|
        if on_ground?(index)
          stopped_since ||= index
          next unless settled_long_enough?(stopped_since, index)

          @landing_index = stopped_since
          break
        else
          stopped_since = nil
        end
      end

      @landing_index
    end

    def settled_long_enough?(stopped_since, index)
      duration = points[index].fl_time - points[stopped_since].fl_time
      duration >= MIN_LANDING_DURATION ||
        (index == points.size - 1 && duration >= MIN_TRAILING_LANDING_DURATION)
    end

    def on_ground?(index)
      horizontal_speed[index] < GROUND_HORIZONTAL_SPEED &&
        vertical_speed[index].abs < GROUND_VERTICAL_SPEED
    end

    def air_speed
      @air_speed ||=
        points.each_index.map { |i| Math.hypot(horizontal_speed[i], vertical_speed[i]) }
    end

    def vertical_speed
      @vertical_speed ||= smooth(points.map(&:v_speed))
    end

    def horizontal_speed
      @horizontal_speed ||= smooth(points.map(&:h_speed))
    end

    def smooth(values)
      window_bounds.map do |low, high|
        values[low..high].sum / (high - low + 1).to_f
      end
    end

    def window_bounds
      @window_bounds ||= begin
        low = 0
        high = 0

        times.each_index.map do |index|
          low = window_start(low, index)
          high = window_end([high, index].max, index)
          [low, high]
        end
      end
    end

    def window_start(low, index)
      low += 1 while low < index && times[index] - times[low] > SMOOTHING_WINDOW / 2.0
      low
    end

    def window_end(high, index)
      high += 1 while high + 1 < times.size && times[high + 1] - times[index] <= SMOOTHING_WINDOW / 2.0
      high
    end

    def times
      @times ||= points.map(&:fl_time)
    end

    def index_at(fl_time)
      points.bsearch_index { |point| point.fl_time >= fl_time } || points.size - 1
    end

    def median(values)
      values.sort[values.size / 2]
    end
  end
end

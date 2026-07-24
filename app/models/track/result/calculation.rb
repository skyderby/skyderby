class Track::Result
  class Calculation
    BASE_START_SPEED = 10
    DISTANCE_IN_TIME_WINDOWS = [20, 25, 30].freeze
    PERFORMANCE_TASKS = %i[speed distance time].freeze

    def self.run(track) = new(track).run

    attr_reader :track

    def initialize(track)
      @track = track
    end

    def run
      track.delete_results

      record_best_window_results
      record_competition_window_results
      record_distance_in_time_results
      record_flare_result
      record_base_race_results
      record_vertical_speed_result
    end

    private

    def record_best_window_results
      return if best_window_segments.blank?

      PERFORMANCE_TASKS.each do |task|
        best = best_window_segments.max_by { |segment| segment.public_send(task) }

        record \
          discipline: task,
          variant: BEST_VARIANT,
          range_from: best.start_altitude,
          range_to: best.end_altitude,
          result: best.public_send(task)
      end
    end

    def record_competition_window_results
      return unless track.skydive?

      PERFORMANCE_TASKS.each do |task|
        segment = best_segment(competition_windows, task: task)
        next unless segment

        record \
          discipline: task,
          variant: COMPETITION_VARIANT,
          range_from: segment.start_altitude,
          range_to: segment.end_altitude,
          result: segment.public_send(task)
      end
    end

    def record_distance_in_time_results
      return unless track.skydive? || track.base?

      DISTANCE_IN_TIME_WINDOWS.each do |seconds|
        window = { from_vertical_speed: BASE_START_SPEED, duration: seconds }
        segment = best_segment([window], task: :distance)
        next unless segment

        record discipline: :distance_in_time, variant: seconds.to_s, result: segment.distance
      end
    end

    def record_flare_result
      return unless track.wingsuit?

      flares = Tracks::FlaresDetector.call(flare_points)
      return if flares.empty?

      highest_flare = flares.max_by(&:altitude_gain)

      record discipline: :flare, variant: 'default', result: highest_flare.altitude_gain
    end

    def record_base_race_results
      return unless track.base? && track.place

      order = Track::Result.higher_is_better?(:base_race) ? :descending : :ascending

      track.place.finish_lines.each do |finish_line|
        window = { from_vertical_speed: BASE_START_SPEED, until_cross_finish_line: finish_line }
        segment = best_segment([window], task: :time, order: order)
        next unless segment

        record discipline: :base_race, variant: finish_line.id.to_s, result: segment.time
      end
    end

    def record_vertical_speed_result
      return unless track.speed_skydiving?

      result = track.speed_skydiving_result
      return unless result.scored? && result.accuracy_valid?

      record discipline: :vertical_speed, variant: 'default', result: result.result
    end

    def best_segment(windows, task:, order: :descending)
      segments = windows.filter_map do |window|
        WindowRangeFinder.new(flight_points).execute(window)
      rescue WindowRangeFinder::ValueOutOfRange, PathIntersectionFinder::IntersectionNotFound
        nil
      end

      return if segments.empty?

      if order == :descending
        segments.max_by { |segment| segment.public_send(task) }
      else
        segments.min_by { |segment| segment.public_send(task) }
      end
    end

    def record(discipline:, variant:, result:, range_from: nil, range_to: nil)
      track.results.create! \
        discipline: discipline,
        variant: variant,
        range_from: range_from,
        range_to: range_to,
        result: result
    end

    def best_window_segments
      @best_window_segments ||= ranges_to_score.map do |range|
        WindowRangeFinder.new(altitude_points).execute \
          from_altitude: range[:start_altitude],
          to_altitude: range[:end_altitude]
      end
    end

    def competition_windows
      [{ from_altitude: 3000, to_altitude: 2000 }].tap do |windows|
        windows << { from_altitude: 2500, to_altitude: 1500 } if track.recorded_at.year >= 2020
      end
    end

    def ranges_to_score
      RangesToScoreFinder.for(track.kind.to_sym).new(track.altitude_bounds).calculate
    end

    def altitude_points
      @altitude_points ||= PointsQuery.execute track,
                                               trimmed: true,
                                               only: %i[gps_time altitude latitude longitude]
    end

    def flight_points
      @flight_points ||= build_flight_points
    end

    def flare_points
      build_flight_points
    end

    def build_flight_points
      raw_points = PointsQuery.execute \
        track,
        trimmed: { seconds_before_start: 10 },
        only: %i[gps_time time_diff altitude latitude longitude h_speed v_speed glide_ratio]

      PointsPostprocessor.for(track.gps_type).call(raw_points)
    end
  end
end

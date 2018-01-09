class CreateTrackService
  class ActivityDataLookup
    SEARCH_SECONDS = 3
    SPEED_THRESHOLD = 20

    def self.call(points)
      new(points).call
    end

    def initialize(points)
      @points ||= points
    end

    def call
      scan_range = []
      points.each do |point|
        scan_range << point

        next if scan_range.last.gps_time - scan_range.first.gps_time < SEARCH_SECONDS
        return true if activity_present(scan_range)
        scan_range.shift
      end

      false
    end

    private

    attr_reader :points

    def activity_present(points_range)
      threshold_map =
        points_range
        .map { |point| point.h_speed > SPEED_THRESHOLD || point.v_speed > SPEED_THRESHOLD }
        .uniq

      threshold_map.one? && threshold_map.first == true
    end
  end
end

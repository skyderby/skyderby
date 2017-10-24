class CreateTrackService
  class TrackSegmentsDetector
    def self.call(points, adapter = TrackSegmenterService)
      new(points, adapter).call
    end

    def initialize(points, adapter)
      @points = points
      @adapter = adapter
    end

    def call
      process_ranges adapter.call(points)
    end

    private

    attr_reader :points

    def process_ranges(ranges)
      ranges
    end
  end
end

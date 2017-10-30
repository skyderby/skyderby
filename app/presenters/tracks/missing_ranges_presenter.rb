module Tracks
  class MissingRangesPresenter
    def self.call(*args)
      new(*args).call
    end

    def initialize(ranges, start_time, end_time)
      @ranges = ranges
      @start_time = start_time
      @end_time = end_time
    end

    def call
      return [] if start_time == end_time

      ranges
        .map do |range|
          range_intersects = selected_range.cover?(range['start']) ||
                             selected_range.cover?(range['end'])
          next unless range_intersects

          range_start = [range['start'] - start_time, 0].max.round(1)
          range_end = [range['end'] - start_time, end_time].min.round(1)
          {
            start: range_start,
            end: range_end
          }
        end
        .compact
    end

    private

    attr_reader :ranges, :start_time, :end_time

    def selected_range
      start_time..end_time
    end
  end
end

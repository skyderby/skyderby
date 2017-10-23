class CreateTrackService
  class MissingRangesDetector
    def self.call(*args)
      new(*args).call
    end

    def initialize(points, data_frequency)
      @points = points
      @data_frequency = data_frequency
    end

    def call
      ranges
        .slice_when { |x, y| x[:default_freq] != y[:default_freq] }
        .map        { |range| range_summary(range) }
        .delete_if  { |range| range[:default_freq] }
        .map        { |range| range.except(:default_freq) }
    end

    private

    attr_reader :points, :data_frequency

    def range_summary(range)
      {
        start: range.first[:start],
        end: range.last[:end],
        default_freq: range.first[:default_freq]
      }
    end

    def ranges
      points.each_cons(2).map do |x, y|
        {
          start: x.fl_time,
          end: y.fl_time,
          default_freq: frequency(x, y) == data_frequency
        }
      end
    end

    def frequency(x, y)
      (1 / (y.fl_time - x.fl_time)).round(1)
    end
  end
end

class CreateTrackService
  class DataFrequencyDetector
    def self.call(points)
      new(points).call
    end

    def initialize(points)
      @points = points || []
    end

    def call
      return 1 unless points.many?
      most_popular_frequency
    end

    private

    attr_reader :points

    def most_popular_frequency
      (1 / most_popular_time_difference).round(1)
    end

    def most_popular_time_difference
      relative_time_stats
        .max_by { |_key, val| val }
        .first
    end

    def relative_time_stats
      points
        .each_cons(2)
        .map { |x, y| y.fl_time - x.fl_time }
        .each_with_object(Hash.new(0)) { |el, agg| agg[el] += 1 }
    end
  end
end

module PointsInterpolation
  class InterpolationProcessor
    def initialize(start_point, end_point, k)
      @start_point = start_point
      @end_point = end_point
      @k = k

      validate!
    end

    def process
      return @start_point if @k == 0
      return @end_point if @k == 1

      new_point = @start_point.clone
      new_point.fl_time = @end_point.fl_time * @k
      new_point.fl_time_abs += new_point.fl_time
      new_point.elevation +=  (@end_point.elevation - @start_point.elevation) * @k
      new_point.latitude += (@end_point.latitude - @start_point.latitude) * @k
      new_point.longitude += (@end_point.longitude - @start_point.longitude) * @k

      new_point
    end

    private

    def validate!
      # Supported only instances of TrackPoint class
      invalid_point_error = ArgumentError.new('Unsupported points class')
      fail invalid_point_error unless @start_point.is_a? TrackPoint
      fail invalid_point_error unless @end_point.is_a? TrackPoint
      # If k < 0 or k > 1 then point we are looking for not between we have here
      fail ArgumentError.new('Invalid k') if @k < 0 || @k > 1
    end
  end

  def self.find_between(start_point, end_point, k)
    InterpolationProcessor.new(start_point, end_point, k).process
  end
end

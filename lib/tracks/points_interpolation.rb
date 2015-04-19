module PointsInterpolation
  class InterpolationProcessor
    def initialize(start_point, end_point, k)
      @start_point = start_point
      @end_point = end_point
      @k = k

      validate!
    end

    def process
      return start_point if k == 0
      return end_point if k ==1

      new_point = start_point.clone
      new_point.latitude += (end_point.latitude - start_point.latitute) * k
      new_point.longitude += (end_point.longitude - start_point.longitude) * k
    end

    private
    
    def validate!
      # Supported only instances of TrackPoint class
      invalid_point_error = ArgumentError.new('Unsupported points class')
      raise invalid_point_error unless @start_point.is_a? TrackPoint 
      raise invalid_point_error unless @end_point.is_a? TrackPoint 
      # If k < 0 or k > 1 then point we are looking for not between we have here
      raise ArgumentError.new('Invalid k') if k < 0 || k > 1
    end
  end

  def self.find_between(start_point, end_point, k)
    InterpolationProcessor.new(start_point, end_point, k).process
  end
end

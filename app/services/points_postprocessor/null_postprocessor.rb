module PointsPostprocessor
  class NullPostprocessor
    def initialize(points, *_args)
      @points = points
    end

    def execute
      @points
    end
  end
end

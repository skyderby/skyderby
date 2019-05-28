module PointsPostprocessor
  class NullPostprocessor
    def self.call(points, *_args)
      points
    end
  end
end

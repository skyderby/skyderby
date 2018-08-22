module PointsPostprocessor
  class NullPostprocessor
    def self.call(points, *args)
      points
    end
  end
end

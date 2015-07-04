# Copied from https://github.com/DanielVartanov/ruby-geometry
# because of name conflict
module Geometry
  class Point < Struct.new(:x, :y)
    def self.new_by_array(array)
      self.new(array[0], array[1])
    end

    def ==(other)
      x == other.x && y == other.y
    end

    def to_vector
      Vector.new(x, y)
    end

    def advance_by(vector)
      Point x + vector.x, y + vector.y
    end
  end
end

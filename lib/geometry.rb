# Copied from https://github.com/DanielVartanov/ruby-geometry
# because of name conflict

require 'geometry/point'
require 'geometry/segment'
require 'geometry/vector'

module Geometry
  include Math
  extend Math

  def distance(point1, point2)
    hypot point1.x - point2.x, point1.y - point2.y
  end

  module_function :distance
end

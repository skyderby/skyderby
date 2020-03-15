# Copied from https://github.com/DanielVartanov/ruby-geometry
# because of name conflict
module Geometry
  class SegmentsDoNotIntersect < StandardError; end
  class SegmentsOverlap < StandardError; end

  Segment = Struct.new(:point1, :point2) do
    def self.new_by_arrays(point1_coordinates, point2_coordinates)
      new(
        Geometry::Point.new_by_array(point1_coordinates),
        Geometry::Point.new_by_array(point2_coordinates)
      )
    end

    def leftmost_endpoint
      (point1.x <=> point2.x) == -1 ? point1 : point2
    end

    def rightmost_endpoint
      (point1.x <=> point2.x) == 1 ? point1 : point2
    end

    def topmost_endpoint
      (point1.y <=> point2.y) == 1 ? point1 : point2
    end

    def bottommost_endpoint
      (point1.y <=> point2.y) == -1 ? point1 : point2
    end

    def contains_point?(point)
      Geometry.distance(point1, point2) ==
        Geometry.distance(point1, point) + Geometry.distance(point, point2)
    end

    def parallel_to?(segment)
      to_vector.collinear_with?(segment.to_vector)
    end

    def lies_on_one_line_with?(segment)
      Segment.new(point1, segment.point1).parallel_to?(self) &&
        Segment.new(point1, segment.point2).parallel_to?(self)
    end

    def intersects_with?(segment)
      Segment.have_intersecting_bounds?(self, segment) &&
        lies_on_line_intersecting?(segment) &&
        segment.lies_on_line_intersecting?(self)
    end

    def overlaps?(segment)
      Segment.have_intersecting_bounds?(self, segment) &&
        lies_on_one_line_with?(segment)
    end

    def intersection_point_with(segment)
      raise SegmentsDoNotIntersect unless intersects_with?(segment)
      raise SegmentsOverlap if overlaps?(segment)

      numerator =
        (segment.point1.y - point1.y) * (segment.point1.x - segment.point2.x) -
        (segment.point1.y - segment.point2.y) * (segment.point1.x - point1.x)

      denominator =
        (point2.y - point1.y) * (segment.point1.x - segment.point2.x) -
        (segment.point1.y - segment.point2.y) * (point2.x - point1.x)

      t = numerator.to_f / denominator

      x = point1.x + t * (point2.x - point1.x)
      y = point1.y + t * (point2.y - point1.y)

      Geometry::Point.new(x, y)
    end

    def distance_to(point)
      q = point.to_vector
      p1 = point1.to_vector
      p2 = point2.to_vector

      return Geometry.distance(q, p1) if p1 == p2

      u = p2 - p1
      v = q - p1

      a = u.scalar_product(v)
      if a.negative?
        p = p1
      else
        b = u.scalar_product(u)
        p =
          if a > b
            p2
          else
            p1 + (a.to_f / b * u)
          end
      end

      Geometry.distance(q, p)
    end

    def length
      Geometry.distance(point1, point2)
    end

    def to_vector
      Vector.new(point2.x - point1.x, point2.y - point1.y)
    end

    protected

    def self.have_intersecting_bounds?(segment1, segment2)
      intersects_on_x_axis =
        (segment1.leftmost_endpoint.x < segment2.rightmost_endpoint.x ||
        segment1.leftmost_endpoint.x == segment2.rightmost_endpoint.x) &&
        (segment2.leftmost_endpoint.x < segment1.rightmost_endpoint.x ||
        segment2.leftmost_endpoint.x == segment1.rightmost_endpoint.x)

      intersects_on_y_axis =
        (segment1.bottommost_endpoint.y < segment2.topmost_endpoint.y ||
        segment1.bottommost_endpoint.y == segment2.topmost_endpoint.y) &&
        (segment2.bottommost_endpoint.y < segment1.topmost_endpoint.y ||
        segment2.bottommost_endpoint.y == segment1.topmost_endpoint.y)

      intersects_on_x_axis && intersects_on_y_axis
    end

    def lies_on_line_intersecting?(segment)
      vector_to_first_endpoint = Segment.new(point1, segment.point1).to_vector
      vector_to_second_endpoint = Segment.new(point1, segment.point2).to_vector

      # FIXME: '>=' and '<=' method of Fixnum and Float should be overriden too
      # (take precision into account) there is a rare case, when this method is
      # wrong due to precision
      to_vector.cross_product(vector_to_first_endpoint) *
        to_vector.cross_product(vector_to_second_endpoint) <= 0
    end
  end
end

module Geometry
  class Vector < Struct.new(:x, :y)
    def ==(vector)
      x === vector.x && y === vector.y
    end        
    
    # Modulus of vector. Also known as length, size or norm
    def modulus      
      Math.hypot(x ,y)
    end

    # z-coordinate of cross product (also known as vector product or outer product)
    # It is positive if other vector should be turned counter-clockwise in order to superpose them.
    # It is negetive if other vector should be turned clockwise in order to superpose them.
    # It is zero when vectors are collinear.
    # Remark: x- and y- coordinates of plane vectors cross product are always zero
    def cross_product(vector)
      x * vector.y - y * vector.x
    end

    # Scalar product, also known as inner product or dot product
    def scalar_product(vector)
      x * vector.x + y * vector.y
    end
    
    def collinear_with?(vector)
      cross_product(vector) === 0
    end

    def +(vector)
      Vector.new(x + vector.x, y + vector.y)
    end

    def -(vector)
      self + (-1) * vector
    end

    def *(scalar)      
      Vector.new(x * scalar, y * scalar)
    end

    def coerce(scalar)      
      if scalar.is_a?(Numeric)
        [self, scalar]
      else
        raise ArgumentError, "Vector: cannot coerce #{scalar.inspect}"
      end             
    end
  end
end

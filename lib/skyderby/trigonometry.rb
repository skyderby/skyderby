module Skyderby
  module Trigonometry
    RAD_PER_DEG = Math::PI / 180
    DEG_PER_RAD = 180 / Math::PI

    def normalize_angle(angle)
      (angle + 540) % 360 - 180
    end

    def deg_to_rad(angle)
      angle * RAD_PER_DEG
    end

    def rad_to_deg(angle)
      angle * DEG_PER_RAD
    end
  end
end

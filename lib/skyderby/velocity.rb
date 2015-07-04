module Skyderby
  class Velocity
    class << self
      # Converts speed in m/s to km/h
      # convertation doing by multiplying on 3600 (second in hour)
      # and dividing by 1000 (meters in km).
      # x * 3600 / 1000 = x * 3.6
      def ms_to_kmh(val)
        val * 3.6
      end
    end
  end
end

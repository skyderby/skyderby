module Skyderby
  module Tracks
    class TrackPoint
      attr_accessor :gps_time,
                    :fl_time_abs,    # Seconds from start track
                    :fl_time,        # Seconds from previous point
                    :latitude,
                    :longitude,
                    :elevation,      # Altitude relative to the ground
                    :elevation_diff, # Altitude difference from previous point
                    :abs_altitude,   # Absolute altitude
                    :distance,       # Distance from previous point
                    :h_speed,        # Horizontal speed
                    :v_speed,        # Vertical speed
                    :full_speed,
                    :glrat,          # Glide Ratio. GR = Horiz. speed / Vertical speed
                    :raw_h_speed,
                    :raw_v_speed,
                    :raw_full_speed,
                    :raw_gr

      def initialize(opts = {})
        set_default_values

        # Changed self[key] = val to send("key", val) because of performance
        opts.each { |key, val| send("#{key}=", val) }

        calculate_gr if @h_speed && @v_speed
        calculate_raw_gr if @raw_h_speed && @raw_v_speed
      end

      def [](key)
        send(key) if respond_to?(key)
      end

      def []=(key, value)
        method_name = "#{key}="
        send(method_name, value) if respond_to?(method_name)
      end

      def latitude=(value)
        value = value.to_d unless value.is_a?(BigDecimal)
        @latitude = value
      end

      def longitude=(value)
        value = value.to_d unless value.is_a?(BigDecimal)
        @longitude = value
      end

      def abs_altitude=(value)
        value = value.to_f unless value.is_a?(Float)
        @abs_altitude = value.round(2)
      end

      def raw_h_speed=(raw_h_speed)
        @raw_h_speed = raw_h_speed

        calculate_raw_gr
        calculate_raw_full_speed
      end

      def raw_v_speed=(raw_v_speed)
        @raw_v_speed = raw_v_speed

        calculate_raw_gr
        calculate_raw_full_speed
      end

      def h_speed=(h_speed)
        @h_speed = h_speed

        calculate_gr
        calculate_full_speed
      end

      def v_speed=(v_speed)
        @v_speed = v_speed

        calculate_gr
        calculate_full_speed
      end

      def to_h
        instance_values.symbolize_keys
      end

      private

      def set_default_values
        @fl_time  = 0
        @distance = 0
        @h_speed  = 0
        @v_speed  = 0
      end

      def calculate_raw_gr
        return unless @raw_h_speed && @raw_v_speed
        @raw_gr = @raw_v_speed == 0 ? 0 : (@raw_h_speed / @raw_v_speed).round(2)
      end

      def calculate_gr
        return unless @h_speed && @v_speed
        @glrat = @v_speed == 0 ? 0 : (@h_speed / @v_speed).round(2)
      end

      def calculate_full_speed
        return unless @h_speed && @v_speed
        @full_speed = full_speed_from_components(@v_speed, @h_speed)
      end

      def calculate_raw_full_speed
        return unless @raw_h_speed && @raw_v_speed
        @raw_full_speed = full_speed_from_components(@raw_v_speed, @raw_h_speed)
      end

      def full_speed_from_components(vertical, horizontal)
        Math.sqrt(vertical**2 + horizontal**2).round(1)
      end
    end
  end
end

class TrackPoint < Struct.new(
  :point_created_at,
  :fl_time_abs,      # Seconds from start track
  :fl_time,          # Seconds from previous point   
  :latitude, 
  :longitude, 
  :elevation,        # Altitude relative to the ground
  :elevation_diff,   # Altitude difference from previous point
  :abs_altitude,     # Absolute altitude
  :distance,         # Distance from previous point
  :h_speed,          # Horizontal speed
  :v_speed,          # Vertical speed
  :glrat,            # Glide Ratio. GR = Horiz. speed / Vertical speed
  :raw_h_speed,
  :raw_v_speed,
  :raw_gr
)

  def initialize(arguments)
    members.each { |m| self[m] = arguments[m] if arguments[m] }

    calculate_gr if h_speed && v_speed
    calculate_raw_gr if raw_h_speed && raw_v_speed
  end

  def raw_h_speed=(raw_h_speed)
    super
    calculate_raw_gr if raw_v_speed
  end

  def raw_v_speed=(raw_v_speed)
    super
    calculate_raw_gr if raw_h_speed
  end

  def h_speed=(h_speed)
    super
    calculate_gr if v_speed
  end

  def v_speed=(v_speed)
    super
    calculate_gr if h_speed
  end

  private

  def calculate_raw_gr
    self.raw_gr = raw_v_speed == 0 ? 0 : (raw_h_speed / raw_v_speed).round(2)
  end

  def calculate_gr
    self.glrat = v_speed == 0 ? 0 : (h_speed / v_speed).round(2)
  end
end

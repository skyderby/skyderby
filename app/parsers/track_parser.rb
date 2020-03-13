module TrackParser
  point_attributes = %i[
    gps_time
    fl_time
    latitude
    longitude
    abs_altitude
    h_speed
    v_speed
    distance
    track_id
  ]

  PointRecord = Struct.new(*point_attributes) do
    def initialize(*)
      super
      self.fl_time  ||= 0.0
      self.distance ||= 0.0
      self.h_speed  ||= 0.0
      self.v_speed  ||= 0.0
    end
  end

  def self.for(format)
    TrackParser.const_get(format.to_s.classify)
  end
end

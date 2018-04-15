module Tracks
  module TrackPoints
    def track_points
      @track_points ||= begin
        raw_points = PointsQuery.execute(track, trimmed: true, freq_1Hz: true)
        # in database speeds in km/h, here we need it in m/s
        raw_points.each do |point|
          point[:h_speed] /= 3.6
          point[:v_speed] /= 3.6
        end
      end
    end
  end
end

class Tracks::GlobePresenter
  def initialize(track)
    @track = track
  end

  def start_time
    points.first[:gps_time]
  end

  def stop_time
    points.last[:gps_time]
  end

  def avg_heading
    headings = points.each_cons(2).map do |pair|
      Skyderby::Geospatial.bearing_between(
        pair.first[:latitude],
        pair.first[:longitude],
        pair.last[:latitude],
        pair.last[:longitude])
    end

    headings.inject(0.0) { |sum, el| sum + el } / headings.size
  end

  def points
    @points ||= 
      track.points.trimmed(seconds_before_start: 5).freq_1Hz.pluck_to_hash(
        'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time',
        :abs_altitude,
        :latitude,
        :longitude,
        :h_speed,
        :v_speed,
        'CASE WHEN v_speed = 0 THEN h_speed / 0.1
              ELSE h_speed / ABS(v_speed)
        END AS glide_ratio'
      )
  end

  private

  attr_reader :track
end

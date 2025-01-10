describe PointsQuery do
  it 'filter points by frequency if freq_1hz specified' do
    result = PointsQuery.execute(track, only: [:fl_time, :abs_altitude], freq_1hz: true)
    expect(result).to match(
      [
        { fl_time: 0.0, abs_altitude: 3500 },
        { fl_time: 1.0, abs_altitude: 3300 },
        { fl_time: 2.0, abs_altitude: 3100 }
      ]
    )
  end

  it 'trim points if trimmed option specified' do
    result = PointsQuery.execute(track, only: [:fl_time, :abs_altitude], trimmed: true)
    expect(result).to match(
      [
        { fl_time: 1.0, abs_altitude: 3300 },
        { fl_time: 1.5, abs_altitude: 3200 },
        { fl_time: 2.0, abs_altitude: 3100 }
      ]
    )
  end

  it 'trim points with additional trimmed option specified' do
    result = PointsQuery.execute(
      track,
      only: [:fl_time, :abs_altitude],
      trimmed: { seconds_before_start: 0.5 }
    )

    expect(result).to match(
      [
        { fl_time: 0.5, abs_altitude: 3400 },
        { fl_time: 1.0, abs_altitude: 3300 },
        { fl_time: 1.5, abs_altitude: 3200 },
        { fl_time: 2.0, abs_altitude: 3100 }
      ]
    )
  end

  def track
    @track ||= create(:empty_track).tap do |trk|
      trk.update!(ff_start: 1, ff_end: 2.5)
      record_points(trk)
    end
  end

  def record_points(track)
    start_time = 1.day.ago.beginning_of_hour
    # rubocop:disable Layout/LineLength
    points =
      [
        { gps_time: start_time,       fl_time: 0.0, abs_altitude: 3500, latitude: 24.8903, longitude: 55.54479, h_speed: 20, v_speed: 20, distance: 20 },
        { gps_time: start_time + 0.5, fl_time: 0.5, abs_altitude: 3400, latitude: 24.8904, longitude: 55.54477, h_speed: 30, v_speed: 30, distance: 20 },
        { gps_time: start_time + 1.0, fl_time: 1.0, abs_altitude: 3300, latitude: 24.8905, longitude: 55.54475, h_speed: 40, v_speed: 40, distance: 20 },
        { gps_time: start_time + 1.5, fl_time: 1.5, abs_altitude: 3200, latitude: 24.8906, longitude: 55.54473, h_speed: 50, v_speed: 50, distance: 20 },
        { gps_time: start_time + 2.0, fl_time: 2.0, abs_altitude: 3100, latitude: 24.8907, longitude: 55.54471, h_speed: 50, v_speed: 60, distance: 20 },
        { gps_time: start_time + 2.5, fl_time: 2.5, abs_altitude: 3000, latitude: 24.8908, longitude: 55.54469, h_speed: 50, v_speed: 70, distance: 20 }
      ]
    # rubocop:enable Layout/LineLength
    points.each { |x| track.points.create!(x) }
  end
end

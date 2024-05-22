describe PointsPostprocessor::Default do
  subject { PointsPostprocessor::Default.call(points) }

  it 'calculates horizontal speed' do
    horizontal_speeds = subject.map { |point| point[:h_speed].round(1) }

    expect(horizontal_speeds).to eq(Array.new(6, 22.6))
  end

  it 'calculates vertical speed' do
    vertical_speeds = subject.map { |point| point[:v_speed].round(1) }

    expect(vertical_speeds).to eq(Array.new(6, 200))
  end

  it 'calculates GR' do
    glide_ratios = subject.map { |point| point[:glide_ratio].round(2) }

    expect(glide_ratios).to eq(Array.new(6, 0.11))
  end

  def points
    start_time = 1.day.ago.beginning_of_hour

    # rubocop:disable Layout/LineLength
    @points ||= [
      { gps_time: start_time,       fl_time: 0.0, altitude: 3500, latitude: 24.8903, longitude: 55.54479, h_speed: 20, v_speed: 20, distance: 20 },
      { gps_time: start_time + 0.5, fl_time: 0.5, altitude: 3400, latitude: 24.8904, longitude: 55.54477, h_speed: 30, v_speed: 30, distance: 20 },
      { gps_time: start_time + 1.0, fl_time: 1.0, altitude: 3300, latitude: 24.8905, longitude: 55.54475, h_speed: 40, v_speed: 40, distance: 20 },
      { gps_time: start_time + 1.5, fl_time: 1.5, altitude: 3200, latitude: 24.8906, longitude: 55.54473, h_speed: 50, v_speed: 50, distance: 20 },
      { gps_time: start_time + 2.0, fl_time: 2.0, altitude: 3100, latitude: 24.8907, longitude: 55.54471, h_speed: 50, v_speed: 60, distance: 20 },
      { gps_time: start_time + 2.5, fl_time: 2.5, altitude: 3000, latitude: 24.8908, longitude: 55.54469, h_speed: 50, v_speed: 70, distance: 20 }
    ]
    # rubocop:enable Layout/LineLength
  end
end

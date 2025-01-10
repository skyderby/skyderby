describe Tracks::FlaresDetector do
  it 'finds flare in skydive track', :aggregate_failures do
    points = points_for '13-31-51_Ravenna.CSV'

    flares = Tracks::FlaresDetector.call(points)

    expect(flares.count).to eq(3)
    expect(flares.first.altitude_gain).to be_within(1).of(7)
    expect(flares.first.gain_duration).to be_within(0.5).of(4)
  end

  it 'handles empty points' do
    flares = Tracks::FlaresDetector.call([])

    expect(flares).to be_empty
  end

  def points_for(filename)
    track = create_track_from_file filename
    PointsQuery.execute track, trimmed: true, only: %i[gps_time altitude v_speed]
  end
end

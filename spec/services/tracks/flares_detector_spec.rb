describe Tracks::FlaresDetector do
  it 'finds flare in skydive track' do
    points = points_for '13-31-51_Ravenna.CSV'
    flares = Tracks::FlaresDetector.call(points)
    expect(flares.count).to eq(3)
    expect(flares.first.altitude_gain).to be_within(1).of(7)
    expect(flares.first.gain_duration).to be_within(0.5).of(4)
  end

  def points_for(filename)
    track = create_track_from_file filename
    PointsQuery.execute track, trimmed: true, only: %i[gps_time altitude]
  end

  def create_track_from_file(filename)
    pilot = create :pilot
    suit = create :suit

    track_file = TrackFile.create(
      file: File.new(Rails.root.join('spec', 'support', 'tracks', filename.to_s))
    )

    params = {
      track_file_id: track_file.id,
      pilot: pilot,
      user: pilot.owner,
      suit: suit
    }
    CreateTrackService.call(params)
  end

end

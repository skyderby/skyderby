describe CreateTrackService::ActivityDataLookup do
  it 'returns true if data recorded' do
    track_file = Track::File.create!(file: File.open(file_fixture('tracks/flysight.csv')))
    track_points = points(track_file)

    result = CreateTrackService::ActivityDataLookup.call(track_points)

    expect(result).to be_truthy
  end

  it 'returns true for garmin file' do
    file = fixture_file_upload('tracks/one_track.gpx')

    track_file = Track::File.create!(file: file)
    track_points = points(track_file)

    result = CreateTrackService::ActivityDataLookup.call(track_points)

    expect(result).to be_truthy
  end

  it 'returns false unless data recorded' do
    file = fixture_file_upload('tracks/flysight_warmup.csv')

    track_file = Track::File.create!(file: file)
    track_points = points(track_file)

    result = CreateTrackService::ActivityDataLookup.call(track_points)

    expect(result).to be_falsey
  end

  def points(track_file, segment: 0)
    @points ||= read_points_from_file(
      file: track_file.file,
      segment: segment,
      format: track_file.file_format
    )
  end

  def read_points_from_file(file:, segment:, format:)
    points = TrackParser.for(format).new(
      file: file,
      segment: segment
    ).parse

    PointsProcessor.for(format).new(points).execute
  end
end

describe SegmentParser::Gpx do
  let(:file) { fixture_file_upload('tracks/two_tracks.gpx') }

  it 'should return segments' do
    parser = described_class.new(file)

    expect(parser.segments.count).to eq 3
  end

  it 'should parse segment name, point count, gain altitude, loose altitude' do
    parser = described_class.new(file)

    segment = parser.segments.first
    expect(segment.name).to eq 'ACTIVE LOG: 20 SEP 2014 15:10'
    expect(segment.points_count).to eq 388
    expect(segment.h_up).to eq 561
    expect(segment.h_down).to eq 3970
  end
end

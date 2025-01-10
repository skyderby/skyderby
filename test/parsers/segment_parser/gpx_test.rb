describe SegmentParser::Gpx do
  let(:path) { file_fixture('tracks/two_tracks.gpx') }
  let(:file) { File.open(path) }
  let(:uploaded_file_mock) do
    double('file').tap { |obj| allow(obj).to receive(:open).and_return(file) }
  end

  it 'should return segments' do
    parser = described_class.new(uploaded_file_mock)

    expect(parser.segments.count).to eq 3
  end

  it 'should parse segment name, point count, gain altitude, loose altitude' do
    parser = described_class.new(uploaded_file_mock)

    segment = parser.segments.first
    expect(segment.name).to eq 'ACTIVE LOG: 20 SEP 2014 15:10'
    expect(segment.points_count).to eq 388
    expect(segment.h_up).to eq 561
    expect(segment.h_down).to eq 3970
  end
end

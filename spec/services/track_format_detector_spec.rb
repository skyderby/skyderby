describe TrackFormatDetector do
  examples = {
    'two_tracks.gpx' => 'gpx',
    'dual_xgps160.kml' => 'kml',
    'wintec.tes' => 'wintec',
    'flysight.csv' => 'flysight',
    'columbus.csv' => 'columbus',
    'cyber_eye.csv' => 'cyber_eye'
  }.freeze

  examples.each do |file_name, format|
    it "determines #{format} format" do
      extension = File.extname(file_name).delete('.').downcase
      file = File.open(file_fixture("tracks/#{file_name}"))

      file_mock = double('file').tap { |obj| allow(obj).to receive(:open).and_return(file) }
      expect(TrackFormatDetector.call(file_mock, extension)).to eq format
    end
  end

  it 'raises error for unknown format' do
    file_path = file_fixture('skyderby_logo.png')
    expect { TrackFormatDetector.call(File.new(file_path), 'png') }
      .to raise_exception(TrackFormatDetector::UnknownFormat)
  end
end

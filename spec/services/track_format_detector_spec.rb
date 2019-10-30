require 'spec_helper'

describe TrackFormatDetector do
  EXAMPLES = {
    'two_tracks.gpx' => 'gpx',
    'dual_xgps160.kml' => 'kml',
    'wintec.tes' => 'wintec',
    'flysight.csv' => 'flysight',
    'columbus.csv' => 'columbus',
    'cyber_eye.csv' => 'cyber_eye'
  }.freeze

  EXAMPLES.each do |file_name, format|
    it "determines #{format} format" do
      extension = File.extname(file_name).delete('.').downcase
      file = File.open(Rails.root.join('spec', 'support', 'tracks', file_name))

      file_mock = double('file').tap { |obj| allow(obj).to receive(:open).and_return(file) }
      expect(TrackFormatDetector.call(file_mock, extension)).to eq format
    end
  end

  it 'raises error for unknown format' do
    file_path = Rails.root.join('spec', 'support', 'skyderby_logo.png')
    expect { TrackFormatDetector.call(File.new(file_path), 'png') }
      .to raise_exception(TrackFormatDetector::UnknownFormat)
  end
end

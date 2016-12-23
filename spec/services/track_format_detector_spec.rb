require 'spec_helper'

describe TrackFormatDetector do
  EXAMPLES = {
    'two_tracks.gpx'   => 'gpx',
    'dual_xgps160.kml' => 'kml',
    'wintec.tes'       => 'wintec',
    'flysight.csv'     => 'flysight',
    'columbus.csv'     => 'columbus',
    'cyber_eye.csv'    => 'cyber_eye'
  }

  EXAMPLES.each do |file_name, format|
    it "determines #{format} format" do
      file_path = Rails.root.join('spec', 'support', 'tracks', file_name)
      expect(TrackFormatDetector.new(path: file_path).execute).to eq format
    end
  end
  
  it 'raises error for unknown format' do
    file_path = Rails.root.join('spec', 'support', 'skyderby_logo.png')
    expect { TrackFormatDetector.new(path: file_path).execute }
      .to raise_exception(TrackFormatDetector::UnknownFormat)
  end
end

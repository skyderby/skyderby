require 'test_helper'

class TrackFormatDetectorTest < ActiveSupport::TestCase
  examples = {
    'two_tracks.gpx' => 'gpx',
    'dual_xgps160.kml' => 'kml',
    'wintec.tes' => 'wintec',
    'flysight.csv' => 'flysight',
    'fs2-track.csv' => 'flysight2',
    'columbus.csv' => 'columbus',
    'cyber_eye.csv' => 'cyber_eye'
  }.freeze

  test 'determines correct format' do
    assert_equal 'gpx', TrackFormatDetector.call(fixture_file_upload('tracks/two_tracks.gpx'), 'gpx')
    assert_equal 'kml', TrackFormatDetector.call(fixture_file_upload('tracks/dual_xgps160.kml'), 'kml')
    assert_equal 'wintec', TrackFormatDetector.call(fixture_file_upload('tracks/wintec.tes'), 'tes')
    assert_equal 'flysight', TrackFormatDetector.call(fixture_file_upload('tracks/flysight.csv'), 'csv')
    assert_equal 'flysight2', TrackFormatDetector.call(fixture_file_upload('tracks/fs2-track.csv'), 'csv')
    assert_equal 'columbus', TrackFormatDetector.call(fixture_file_upload('tracks/columbus.csv'), 'csv')
    assert_equal 'cyber_eye', TrackFormatDetector.call(fixture_file_upload('tracks/cyber_eye.csv'), 'csv')
  end

  test 'raises error for unknown format' do
    assert_raises(TrackFormatDetector::UnknownFormat) do
      TrackFormatDetector.call(fixture_file_upload('skyderby_logo.png'), 'png')
    end
  end
end

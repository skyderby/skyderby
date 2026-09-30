require 'test_helper'

class TrackUploadWithSensorTest < ActionDispatch::IntegrationTest
  test 'uploads FlySight 2 track together with sensor file' do
    sign_in users(:regular_user)

    assert_difference -> { Track.count }, 1 do
      post track_files_path, params: {
        track_file: {
          files: [fixture_file_upload('tracks/fs2-track.csv'), fixture_file_upload('tracks/fs2-sensor.csv')],
          track_attributes: { kind: :speed_skydiving, visibility: :public_track }
        }
      }
    end

    track_file = Track.last.track_file
    assert_equal 'fs2-track.csv', track_file.file.filename.to_s
    assert_equal 'fs2-sensor.csv', track_file.sensor_file.filename.to_s
  end
end

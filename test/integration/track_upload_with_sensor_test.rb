require 'test_helper'

class TrackUploadWithSensorTest < ActionDispatch::IntegrationTest
  test 'uploads FlySight 2 track together with sensor file' do
    sign_in users(:regular_user)

    assert_enqueued_with(job: SensorSamplesJob) do
      upload_track_with_sensor
    end

    track_file = Track.last.track_file
    assert_equal 'fs2-track.csv', track_file.file.filename.to_s
    assert_equal 'fs2-sensor.csv.gz', track_file.sensor_file.filename.to_s
  end

  private

  def upload_track_with_sensor
    assert_difference -> { Track.count }, 1 do
      post track_files_path, params: {
        track_file: {
          files: [fixture_file_upload('tracks/fs2-track.csv'), fixture_file_upload('tracks/fs2-sensor.csv')],
          track_attributes: { kind: :speed_skydiving, visibility: :public_track }
        }
      }
    end
  end
end

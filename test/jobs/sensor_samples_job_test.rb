require 'test_helper'

class SensorSamplesJobTest < ActiveJob::TestCase
  test 'imports sensor samples and rescores online competitions' do
    track = create_track_from_file('speed_skydiving_411.csv', kind: :speed_skydiving, suit: nil)
    attach_sensor_data(track) { [0.0, 0.0, 1.0] }
    track.sensor_samples.delete_all

    assert_enqueued_with(job: OnlineCompetitionJob, args: [track.id]) do
      SensorSamplesJob.perform_now(track.id)
    end
    assert_predicate track.sensor_samples, :exists?
  end
end

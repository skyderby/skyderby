require 'test_helper'

class OnlineCompetitionJobTest < ActiveJob::TestCase
  test 'reimports sensor samples before scoring' do
    track = create_track_from_file('speed_skydiving_411.csv', kind: :speed_skydiving, suit: nil)
    attach_sensor_data(track) { [0.0, 0.0, 1.0] }
    track.sensor_samples.delete_all

    OnlineCompetitionJob.perform_now(track.id)

    assert_predicate track.sensor_samples, :exists?
  end
end

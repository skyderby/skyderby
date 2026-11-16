require 'test_helper'

class TrackPointsBackfillJobTest < ActiveJob::TestCase
  test 'copies legacy points and restores accuracy from the file' do
    track = create_track_from_file('flysight.csv')
    expected = Track::Points.find(track.id).vertical_accuracy
    Track::Points.where(track:).delete_all
    Point.where(track:).update_all(horizontal_accuracy: nil, vertical_accuracy: nil, speed_accuracy: nil)

    TrackPointsBackfillJob.perform_now([track.id])

    assert_equal expected, Track::Points.find(track.id).vertical_accuracy
  end
end

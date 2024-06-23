require 'test_helper'

class CreateTrackServiceTest < ActiveSupport::TestCase
  test '#call - saves track' do
    track = CreateTrackService.call(valid_params)
    assert_predicate track, :persisted?
  end

  test 'activity data validation - marks track as require to review' do
    track = CreateTrackService.call(with_missing_activity_data)
    assert track.require_range_review
  end

  def valid_params
    @valid_params ||= begin
      place = create :place
      profile = create :profile
      suit = create :suit

      {
        track_file_id: track_file.id,
        kind: :skydive,
        place: place,
        pilot: profile,
        suit: suit
      }
    end
  end

  def with_missing_activity_data
    file = fixture_file_upload('tracks/flysight_warmup.csv')
    track_file_with_missing_activity = Track::File.create!(file: file)

    valid_params.merge(track_file_id: track_file_with_missing_activity.id)
  end

  def track_file
    @track_file ||= Track::File.create!(
      file: File.open(file_fixture('tracks/flysight.csv'))
    )
  end
end

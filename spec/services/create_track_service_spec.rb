describe CreateTrackService do
  describe '#call' do
    it 'saves track' do
      track = CreateTrackService.call(valid_params)
      expect(track.persisted?).to be_truthy
    end
  end

  describe 'activity data validation' do
    it 'marks track as require to review' do
      track = CreateTrackService.call(with_missing_activity_data)
      expect(track.require_range_review).to be_truthy
    end
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

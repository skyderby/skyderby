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
    file = Rack::Test::UploadedFile.new(
      Rails.root.join('spec', 'support', 'tracks', 'flysight_warmup.csv')
    )

    track_file_with_missing_activity = create :track_file, file: file

    valid_params.merge(track_file_id: track_file_with_missing_activity.id)
  end

  def track_file
    @track_file ||= create :track_file
  end
end

describe Tracks::VideosController do
  describe 'regular user' do
    describe '#show' do
      it 'allows on public' do
        track = create_track_from_file 'flysight.csv'
        create :track_video, track: track

        get :show, params: { track_id: track.id }
        expect(response.success?).to be_truthy
      end
    end
  end
end

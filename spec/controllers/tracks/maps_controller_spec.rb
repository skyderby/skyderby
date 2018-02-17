describe Tracks::MapsController do
  describe 'regular user' do
    describe '#show' do
      it 'allows on public' do
        track = create_track_from_file 'flysight.csv'

        get :show, params: { track_id: track.id }
        expect(response.success?).to be_truthy
      end
    end
  end
end

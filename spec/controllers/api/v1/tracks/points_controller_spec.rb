describe Api::V1::Tracks::PointsController do
  render_views

  describe '#show' do
    it 'public track' do
      track = tracks(:hellesylt)
      track.public_track!

      get :show, params: { track_id: track.id }, format: :json

      expect(response).to have_http_status(:success)
      expect(response.parsed_body.count).to eq(34)
    end

    it 'private track' do
      track = tracks(:hellesylt)
      track.private_track!

      get :show, params: { track_id: track.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end

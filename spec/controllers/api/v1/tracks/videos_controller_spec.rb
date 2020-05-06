describe Api::V1::Tracks::VideosController do
  render_views

  describe '#show' do
    it 'has no video' do
      track = tracks(:hellesylt)
      track.public_track!

      get :show, params: { track_id: track.id }, format: :json

      expect(response).to have_http_status(:not_found)
    end

    it 'public track', :aggregate_failures do
      track = tracks(:track_with_video)
      track.public_track!

      get :show, params: { track_id: track.id }, format: :json

      expect(response).to have_http_status(:success)

      response_json = JSON.parse(response.body)
      expect(response_json.keys).to match_array(%w[url videoCode trackOffset videoOffset])
    end

    it 'private track' do
      track = tracks(:track_with_video)
      track.private_track!

      get :show, params: { track_id: track.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end

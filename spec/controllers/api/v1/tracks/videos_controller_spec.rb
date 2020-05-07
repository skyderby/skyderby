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

  describe '#create' do
    it 'happy path', :aggregate_failures do
      track = tracks(:hellesylt)
      track.update!(owner: users(:regular_user))

      sign_in users(:regular_user)

      video_params = {
        track_video: {
          url: 'https://www.youtube.com/watch?v=RANDOM',
          video_code: 'RANDOM',
          video_offset: 10,
          track_offset: 225
        }
      }

      post :create, params: { track_id: track.id, **video_params }, format: :json

      expect(response).to have_http_status(:success)

      response_json = JSON.parse(response.body)
      expect(response_json).to match(
        hash_including(
          'url' => 'https://www.youtube.com/watch?v=RANDOM',
          'videoCode' => 'RANDOM',
          'videoOffset' => 10.0,
          'trackOffset' => 225.0
        )
      )
    end

    it 'without permissions to' do
      track = tracks(:track_with_video)
      track.update!(owner: users(:admin))

      sign_in users(:regular_user)

      video_params = { track_video: { url: 'https://www.youtube.com/watch?v=RANDOM' } }
      post :create, params: { track_id: track.id, **video_params }, format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe '#destroy' do
    it 'happy path', :aggregate_failures do
      track = tracks(:track_with_video)
      track.update!(owner: users(:regular_user))

      sign_in users(:regular_user)

      delete :destroy, params: { track_id: track.id }, format: :json

      expect(response).to have_http_status(:no_content)
      expect(track.video).to be_blank
    end

    it 'with permissions but without video' do
      track = tracks(:hellesylt)
      track.update!(owner: users(:regular_user))

      sign_in users(:regular_user)

      delete :destroy, params: { track_id: track.id }, format: :json

      expect(response).to have_http_status(:no_content)
    end

    it 'without permissions to' do
      track = tracks(:track_with_video)
      track.update!(owner: users(:admin))

      sign_in users(:regular_user)

      delete :destroy, params: { track_id: track.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end

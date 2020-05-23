describe Api::V1::TracksController do
  render_views

  let(:track_attributes) do
    hash_including(
      'id',
      'profileId',
      'suitId',
      'placeId',
      'dataFrequency',
      'downloadable',
      'hasVideo',
      'comment',
      'createdAt',
      'recordedAt',
      'jumpRange' => hash_including('from', 'to')
    )
  end
  describe '#index' do
    it 'has correct keys in response' do
      get :index, format: :json

      expect(response.parsed_body).to match(
        hash_including(
          'currentPage',
          'totalPages',
          'items' => all(
            match(
              hash_including(
                'id',
                'name',
                'profileId',
                'suitId',
                'placeId',
                'distance',
                'speed',
                'time',
                'comment',
                'recordedAt'
              )
            )
          )
        )
      )
    end

    it 'scope by policy' do
      visible_track = tracks(:hellesylt)
      hidden_track = tracks(:track_with_video).tap(&:private_track!)

      get :index, format: :json

      track_ids = response.parsed_body.dig('items').map { |track| track['id'] }

      expect(track_ids).to include(visible_track.id)
      expect(track_ids).not_to include(hidden_track.id)
    end
  end

  describe '#show' do
    it 'has renders correct keys', :aggregate_failures do
      track = tracks(:hellesylt)

      get :show, params: { id: track.id }, format: :json

      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to match(track_attributes)
    end

    it 'when do not have access to track' do
      track = tracks(:hellesylt)
      track.private_track!

      get :show, params: { id: track.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe '#update' do
    it 'updates track', :aggregate_failures do
      sign_in users(:regular_user)

      track = tracks(:hellesylt)
      track.update(owner: users(:regular_user))

      put :update, params: { id: track.id, track: { comment: 'NEW COMMENT' } }, format: :json

      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to match(track_attributes)

      expect(track.reload.comment).to eq('NEW COMMENT')
    end

    it 'when not owner' do
      sign_in users(:regular_user)

      track = tracks(:hellesylt)
      track.update(owner: users(:admin))

      delete :destroy, params: { id: track.id }, format: :json

      expect(response).to have_http_status(:success)
    end
  end

  describe '#destroy' do
    it 'when owner' do
      sign_in users(:regular_user)

      track = tracks(:track_with_video)
      track.update(owner: users(:regular_user))

      delete :destroy, params: { id: track.id }, format: :json

      expect(response).to have_http_status(:no_content)
    end

    it 'when it cannot be deleted due to depentend records' do
      sign_in users(:regular_user)

      track = tracks(:hellesylt)
      track.update(owner: users(:regular_user))

      delete :destroy, params: { id: track.id }, format: :json

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body).to eq \
        'errors' =>
          { 'base' =>
            ['Cannot delete record because a dependent event result exists'] }
    end

    it 'when not allowed' do
      sign_in users(:regular_user)

      track = tracks(:hellesylt)
      track.update(owner: users(:admin))

      delete :destroy, params: { id: track.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end
end

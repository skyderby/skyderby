describe Api::V1::UsersController do
  render_views

  describe '#index' do
    it 'is not allowed for guest users' do
      get :index, format: :json

      expect(response).to have_http_status(:forbidden)
    end

    it 'is not allowed for non-admin users' do
      sign_in users(:regular_user)

      get :index, format: :json

      expect(response).to have_http_status(:forbidden)
    end

    it 'is allowed for admin users' do
      sign_in users(:admin)

      get :index, format: :json

      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to match(
        hash_including(
          'currentPage',
          'totalPages',
          'items' => all(
            match(
              hash_including(
                'id',
                'name',
                'email',
                'createdAt',
                'confirmed',
                'oauth'
              )
            )
          )
        )
      )
    end
  end
end

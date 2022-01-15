describe Api::V1::ContributionsController do
  render_views

  describe '#index' do
    it 'forbidden for non-admin users' do
      get :index, format: :json

      expect(response).to be_forbidden
    end

    it 'returns list of contributions for admin users' do
      sign_in users(:admin)

      get :index, format: :json

      expect(response).to be_successful
      expect(response.parsed_body).to(
        match(
          hash_including(
            'currentPage',
            'totalPages',
            'items' => all(
              match(
                hash_including('id', 'receivedAt', 'amount')
              )
            )
          )
        )
      )
    end
  end
end

describe Api::V1::TerrainProfilesController do
  render_views

  describe '#index' do
    it 'returns terrain profile params' do
      get :index, format: :json

      expect(response).to be_successful
      expect(response.parsed_body).to(
        match(
          hash_including(
            'items' => all(
              match(
                hash_including('id', 'placeId', 'name')
              )
            ),
            'relations' => hash_including('places')
          )
        )
      )
    end
  end
end

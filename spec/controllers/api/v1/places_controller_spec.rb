describe Api::V1::PlacesController do
  render_views

  describe '#index' do
    it 'returns correct fields' do
      get :index, format: :json

      response_json = JSON.parse(response.body)
      fields = response_json['items'].map(&:keys).flatten.uniq

      expect(fields).to match(%w[id name countryId kind latitude longitude msl])
    end

    it 'filters by ids' do
      country = countries(:norway)
      hellesylt = places(:hellesylt)
      loen = places(:loen)

      3.times { Place.create!(name: 'test', latitude: 1, longitude: 1, country: country) }

      get :index, format: :json, params: { ids: [hellesylt.id, loen.id] }

      expect(response).to be_successful

      names = response.parsed_body.fetch('items').map { |el| el['name'] }
      expect(names).to match_array([hellesylt.name, loen.name])
    end
  end
end

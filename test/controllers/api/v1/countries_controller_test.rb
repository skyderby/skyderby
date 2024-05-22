describe Api::V1::CountriesController do
  render_views

  describe '#index' do
    it 'returns correct fields' do
      get :index, format: :json

      fields = response.parsed_body['items'].map(&:keys).flatten.uniq

      expect(fields).to match(%w[id name code])
    end

    it 'filters by ids' do
      norway = countries(:norway)
      russia = countries(:russia)

      3.times { |idx| Country.create!(name: 'test', code: idx) }

      get :index, format: :json, params: { ids: [norway.id, russia.id] }

      expect(response).to be_successful

      names = response.parsed_body.fetch('items').map { |el| el['name'] }
      expect(names).to match_array([norway.name, russia.name])
    end
  end
end

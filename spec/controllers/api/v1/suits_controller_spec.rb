describe Api::V1::SuitsController do
  render_views

  describe '#index' do
    it 'returns correct fields' do
      get :index, format: :json

      response_json = JSON.parse(response.body)
      fields = response_json['items'].map(&:keys).flatten.uniq

      expect(fields).to match(%w[id name makeId category editable])
    end

    it 'filters by ids' do
      manufacturer = manufacturers(:tony)
      apache = suits(:apache)
      nala = suits(:nala)

      3.times { Suit.create!(name: 'test', manufacturer: manufacturer) }

      get :index, format: :json, params: { ids: [apache.id, nala.id] }

      expect(response).to be_successful

      names = response.parsed_body.fetch('items').map { |el| el['name'] }
      expect(names).to match_array([apache.name, nala.name])
    end
  end
end

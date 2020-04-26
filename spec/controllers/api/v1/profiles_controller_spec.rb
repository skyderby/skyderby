describe Api::V1::ProfilesController, type: :controller do
  render_views

  it '#show' do
    get :show, params: { id: profile.id }, format: :json

    response_json = JSON.parse(response.body)

    expected_json =
      {
        id: profile.id,
        name: profile.name,
        photo: {
          original: '/images/original/missing.png',
          medium: '/images/medium/missing.png',
          thumb: '/images/thumb/missing.png'
        }
      }.with_indifferent_access

    expect(response_json).to eq(expected_json)
  end

  describe '#index' do
    it 'returns none if no search term provided' do
      get :index, format: :json

      response_json = JSON.parse(response.body)

      expect(response_json['items']).to eq([])
    end

    it 'returns collection if search term specified' do
      get :index, params: { search: 'ale' }, format: :json

      response_json = JSON.parse(response.body)

      expect(response_json['items']).to include(hash_including({ 'name' => 'Alex' }))
    end
  end

  def profile
    @profile ||= profiles(:alex)
  end
end

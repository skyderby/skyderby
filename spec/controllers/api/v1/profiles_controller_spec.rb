describe Api::V1::ProfilesController, type: :controller do
  render_views

  it '#show' do
    profile = create :profile, name: 'Pilot 1'
    get :show, params: { id: profile.id }, format: :json
    json = JSON.parse(response.body)
    expected_result = {
      'id' => profile.id,
      'name' => 'Pilot 1',
      'photo' => '/images/original/missing.png',
      'photo_medium' => '/images/medium/missing.png',
      'photo_thumb' => '/images/thumb/missing.png'
    }

    expect(json).to eq(expected_result)
  end
end

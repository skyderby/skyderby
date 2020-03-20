describe Api::V1::ProfilesController, type: :controller do
  render_views

  it '#show' do
    get :show, params: { id: profile.id }, format: :json

    response_json = JSON.parse(response.body)
    expected_json = JSON.parse(expected_result.to_json)

    expect(response_json).to eq(expected_json)
  end

  def expected_result
    {
      id: profile.id,
      name: profile.name,
      photo: {
        original: '/images/original/missing.png',
        medium: '/images/medium/missing.png',
        thumb: '/images/thumb/missing.png'
      }
    }
  end

  def profile
    @profile ||= profiles(:alex)
  end
end

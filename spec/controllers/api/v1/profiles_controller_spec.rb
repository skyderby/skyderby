describe Api::V1::ProfilesController, type: :controller do
  render_views

  it '#show' do
    get :show, params: { id: profile.id }, format: :json

    expected_json = JSON.parse(expected_result.to_json)

    expect(response.parsed_body).to eq(expected_json)
  end

  def expected_result
    {
      id: profile.id,
      name: profile.name,
      photo: {
        original: '/images/original/missing.png',
        medium: '/images/medium/missing.png',
        thumb: '/images/thumb/missing.png'
      },
      personal_scores: []
    }
  end

  def profile
    @profile ||= profiles(:alex)
  end
end

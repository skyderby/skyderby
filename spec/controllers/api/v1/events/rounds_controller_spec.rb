describe Api::V1::Events::RoundsController do
  render_views

  it '#index' do
    get :index, params: { event_id: events(:published_public).id }, format: :json
    expect(response.successful?).to be_truthy

    expected_response = JSON.parse([
      { id: 1, discipline: 'distance', number: 1 },
      { id: 2, discipline: 'speed', number: 1 }
    ].to_json)

    expect(response.parsed_body).to eq(JSON.parse(expected_response.to_json))
  end
end

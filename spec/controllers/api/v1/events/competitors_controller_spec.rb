describe Api::V1::Events::CompetitorsController do
  render_views

  it '#index' do
    get :index, params: { event_id: events(:published_public).id }, format: :json
    expect(response.successful?).to be_truthy

    expect(response.parsed_body).to eq(JSON.parse(expected_response.to_json))
  end

  def expected_response
    [
      {
        id: 1,
        name: 'John',
        suit_id: suits(:apache).id,
        suit_name: 'Apache Series',
        category_id: event_sections(:speed_distance_time_advanced).id,
        category_name: 'Advanced'
      }, {
        id: 2,
        name: 'Travis',
        suit_id: suits(:apache).id,
        suit_name: 'Apache Series',
        category_id: event_sections(:speed_distance_time_advanced).id,
        category_name: 'Advanced'
      }
    ]
  end
end

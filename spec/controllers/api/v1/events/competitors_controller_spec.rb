describe Api::V1::Events::CompetitorsController do
  render_views

  it '#index' do
    get :index, params: { event_id: events(:published_public).id }, format: :json
    expect(response.successful?).to be_truthy

    response_json = JSON.parse(response.body)
    expect(response_json).to match(JSON.parse(expected_response.to_json))
  end

  def expected_response
    [
      {
        id: 1,
        name: 'John',
        suitId: suits(:apache).id,
        suitName: 'Apache Series',
        categoryId: event_sections(:speed_distance_time_advanced).id,
        categoryName: 'Advanced'
      }, {
        id: 2,
        name: 'Travis',
        suitId: suits(:apache).id,
        suitName: 'Apache Series',
        categoryId: event_sections(:speed_distance_time_advanced).id,
        categoryName: 'Advanced'
      }
    ]
  end
end

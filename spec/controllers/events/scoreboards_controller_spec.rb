describe Events::ScoreboardsController do
  render_views

  it '#show' do
    event = events(:published_public)

    get :show, params: { event_id: event.id}, format: :json

    response_json = JSON.parse(response.body)
    expected_json = JSON.parse(expected_result.to_json)

    expect(response_json).to match(expected_json)
  end

  def expected_result
    {
      sections: [{
        name:  'Advanced',
        id:    section_advanced.id,
        order: section_advanced.order
      }, {
        name:  'Intermediate',
        id:    section_intermediate.id,
        order: section_intermediate.order
      }],
      competitors: [{
        id: competitor_1.id,
        name: competitor_1.name,
        section_id: section_advanced.id,
        total_points: '192.59',
        results: [{
          discipline: 'distance',
          round: 1,
          result: '3000.0',
          points: '100.0'
        }, {
          discipline: 'speed',
          round: 1,
          result: '250.0',
          points: '92.6'
        }]
      }, {
        id: competitor_2.id,
        name: competitor_2.name,
        section_id: section_advanced.id,
        total_points: '183.33',
        results: [{
          discipline: 'distance',
          round: 1,
          result: '2500.0',
          points: '83.3'
        }, {
          discipline: 'speed',
          round: 1,
          result: '270.0',
          points: '100.0'
        }]
      }]
    }
  end

  def section_advanced
    @section_advanced ||= sections(:speed_distance_time_advanced)
  end

  def section_intermediate
    @section_intermediate ||= sections(:speed_distance_time_intermediate)
  end

  def competitor_1
    @competitor_1 ||= competitors(:competitor_1)
  end

  def competitor_2
    @competitor_2 ||= competitors(:competitor_2)
  end
end

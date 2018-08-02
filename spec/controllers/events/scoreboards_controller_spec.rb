describe Events::ScoreboardsController do
  render_views

  it '#show, format: :json' do
    event = events(:published_public)

    get :show, params: { event_id: event.id}, format: :json

    response_json = JSON.parse(response.body)
    expected_json = JSON.parse(expected_result.to_json)

    expect(response_json).to match(expected_json)
  end

  it '#show, format: :html' do
    event = events(:published_public)

    get :show, params: { event_id: event.id}

    expect(response.redirect?).to be_truthy
    expect(response.location).to eq(event_url(event))
  end

  def expected_result
    {
      sections: [{
        id:    section_advanced.id,
        name:  'Advanced',
        order: section_advanced.order
      }, {
        id:    section_intermediate.id,
        name:  'Intermediate',
        order: section_intermediate.order
      }],
      competitors: [{
        id: competitor_2.id,
        name: 'Travis',
        section_id: section_advanced.id,
        country_code: 'NOR',
        suit_name: 'TS Apache Series',
        total_points: 183.33,
        results: [{
          discipline: 'distance',
          round: 1,
          result: '2500',
          points: '83.3'
        }, {
          discipline: 'speed',
          round: 1,
          result: '270.0',
          points: '100.0'
        }]
      }, {
        id: competitor_1.id,
        name: 'John',
        section_id: section_advanced.id,
        country_code: 'NOR',
        suit_name: 'TS Apache Series',
        total_points: 174.07,
        results: [{
          discipline: 'distance',
          round: 1,
          result: '3000',
          points: '100.0'
        }, {
          discipline: 'speed',
          round: 1,
          result: '200.0',
          points: '74.1'
        }]
      }]
    }
  end

  def section_advanced
    @section_advanced ||= event_sections(:speed_distance_time_advanced)
  end

  def section_intermediate
    @section_intermediate ||= event_sections(:speed_distance_time_intermediate)
  end

  def competitor_1
    @competitor_1 ||= event_competitors(:competitor_1)
  end

  def competitor_2
    @competitor_2 ||= event_competitors(:competitor_2)
  end
end

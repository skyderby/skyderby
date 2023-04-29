describe Api::V1::Events::ResultsController do
  render_views

  it '#index' do
    event = events(:published_public)

    get :index, params: { event_id: event.id }, format: :json

    response_json = response.parsed_body
    result_numbers = response_json.pluck('result')
    rounds = response_json.pluck('round_name')

    expect(result_numbers).to eq(['3000.0', '250.0', '2500.0', '270.0'])
    expect(rounds).to eq(%w[Distance-1 Speed-1 Distance-1 Speed-1])
  end

  describe '#create' do
    it 'when not allowed' do
      event = events(:published_public)
      post :create, params: { event_id: event.id }

      expect(response.forbidden?).to be_truthy
    end

    it 'when allowed, with correct data' do
      sign_in users(:event_responsible)

      event = events(:published_public)
      round = event.rounds.create!(discipline: :distance)
      competitor = event_competitors(:competitor_1)

      event.reference_points.create!(name: 'Lane 1', latitude: 20, longitude: 20)

      params = {
        event_id: event.id,
        competitor_name: competitor.name,
        round_name: 'Distance-2',
        penalized: 'true',
        penalty_size: 10,
        'reference_point[name]': 'Lane 1',
        'reference_point[latitude]': '40.0',
        'reference_point[longitude]': '40.0',
        'jump_range[exit_time]': '2018-02-24T15:23:44.40Z',
        'jump_range[deploy_time]': '2018-02-24T15:26:24.40Z',
        'track_attributes[file]': fixture_file_upload('files/tracks/distance_2454.csv')
      }

      post :create, params: params, format: :json

      expect(response.successful?).to be_truthy

      response_json = response.parsed_body

      result = event.results.last
      expect(response_json['id']).to eq(result.id)
      expect(result.penalized).to be_truthy

      track = result.track
      expect(track.ff_start).to eq(2405)
      expect(track.ff_end).to eq(2565)

      expect(round.reference_point_assignments.where(competitor: competitor)).not_to be_blank
      expect(event.reference_points.count).to eq(2)
    end
  end
end

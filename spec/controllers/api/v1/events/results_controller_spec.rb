describe Api::V1::Events::ResultsController do
  render_views

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

      params = {
        event_id: event.id,
        competitor_name: competitor.name,
        round_name: "Distance-2",
        penalized: 'true',
        'jump_range[exit_time]': '2018-02-24T15:23:44.40Z',
        'jump_range[deploy_time]': '2018-02-24T15:26:24.40Z',
        'track_attributes[file]': fixture_file_upload('files/tracks/distance_2454.csv')
      }

      post :create, params: params, format: :json

      expect(response.successful?).to be_truthy

      response_json = JSON.parse(response.body)

      result = event.results.last
      expect(response_json['id']).to eq(result.id)
      expect(result.penalized).to be_truthy

      track = result.track
      expect(track.ff_start).to eq(2405)
      expect(track.ff_end).to eq(2565)
    end
  end
end

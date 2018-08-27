describe Api::V1::Events::ResultsController do
  render_views

  describe '#create' do
    it 'when not allowed' do
      event = events(:published_public)
      post :create, params: { event_id: event.id }

      expect(response.forbidden?).to be_truthy
    end

    it 'when allowed' do
      sign_in users(:event_responsible)

      event = events(:published_public)
      round = event.rounds.create!(discipline: :distance)
      competitor = event_competitors(:competitor_1)

      params = {
        event_id: event.id,
        competitor_id: competitor.id,
        round_id: round.id,
        'track_attributes[file]': fixture_file_upload('files/tracks/distance_2454.csv')
      }

      post :create, params: params, format: :json

      expect(response.successful?).to be_truthy

      response_json = JSON.parse(response.body)
      expect(response_json['id']).to eq(event.results.last.id)
    end
  end
end

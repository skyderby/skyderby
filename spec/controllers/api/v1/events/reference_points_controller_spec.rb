describe Api::V1::Events::ReferencePointsController do
  render_views

  describe '#index' do
    it 'happy path' do
      event = events(:published_public)
      event.reference_points.create!(name: 'R1', latitude: 20.0, longitude: 25.0)
      event.reference_points.create!(name: 'R2', latitude: 30.0, longitude: 35.0)

      get :index, params: { event_id: event.id }, format: :json

      aggregate_failures 'testing response' do
        expect(response).to be_successful

        response_data = response.parsed_body
        expect(response_data.pluck('name')).to eq(%w[R1 R2])
        expect(response_data.pluck('latitude')).to eq(['20.0', '30.0'])
        expect(response_data.pluck('longitude')).to eq(['25.0', '35.0'])
      end
    end

    it 'permissions required' do
      event = events(:draft_public)
      event.reference_points.create!(name: 'R1', latitude: 20.0, longitude: 25.0)
      event.reference_points.create!(name: 'R2', latitude: 30.0, longitude: 35.0)

      get :index, params: { event_id: event.id }, format: :json

      expect(response).to be_forbidden
    end
  end
end

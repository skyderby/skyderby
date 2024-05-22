describe Api::V1::Events::Rounds::ReferencePointAssignmentsController do
  describe '#create' do
    it 'correct user assigns point' do
      sign_in users(:event_responsible)

      event = events(:published_public)
      competitor = event_competitors(:competitor_1)
      round = event_rounds(:distance_round_1)
      reference_point = event.reference_points.create! \
        name: 'R1',
        latitude: 20,
        longitude: 20

      params = {
        event_id: event.id,
        round_id: round.id,
        competitor_id: competitor.id,
        reference_point_id: reference_point.id
      }

      post :create, params: params, format: :json

      expect(response).to be_successful

      assignment = event.reference_point_assignments.find_by(competitor: competitor, round: round)
      expect(assignment.reference_point).to eq(reference_point)
    end

    it 'correct user nullify assignment' do
      sign_in users(:event_responsible)

      event = events(:published_public)
      competitor = event_competitors(:competitor_1)
      round = event_rounds(:distance_round_1)

      params = {
        event_id: event.id,
        round_id: round.id,
        competitor_id: competitor.id,
        reference_point_id: nil
      }

      post :create, params: params, format: :json

      expect(response).to be_successful

      assignment = event.reference_point_assignments.find_by(competitor: competitor, round: round)
      expect(assignment).not_to be_present
    end

    it 'incorrect user nullify assignment' do
      event = events(:published_public)
      competitor = event_competitors(:competitor_1)
      round = event_rounds(:distance_round_1)

      params = {
        event_id: event.id,
        round_id: round.id,
        competitor_id: competitor.id,
        reference_point_id: nil
      }

      post :create, params: params, format: :json

      expect(response).to be_forbidden
    end
  end
end

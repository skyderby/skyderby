describe Api::V1::PerformanceCompetitions::ReferencePointAssignmentsController do
  let(:event) { events(:published_public) }
  let(:event_responsible) { users(:event_responsible) }
  let(:random_user) { User.create!(email: 'some@example.com', password: '123456', confirmed_at: Time.zone.today) }
  let(:competitor) { event_competitors(:competitor_1) }
  let(:round) { event_rounds(:distance_round_1) }

  describe '#create' do
    it 'assign reference point', :aggregate_failures do
      sign_in event_responsible

      reference_point = event.reference_points.create! \
        name: 'R1',
        latitude: 20,
        longitude: 20

      params = {
        performance_competition_id: event.id,
        reference_point_assignment: {
          round_id: round.id,
          competitor_id: competitor.id,
          reference_point_id: reference_point.id
        }
      }

      post :create, params: params, format: :json

      expect(response).to be_successful

      assignment = event.reference_point_assignments.find_by(competitor: competitor, round: round)
      expect(assignment.reference_point).to eq(reference_point)
    end

    it 'remove assignment', :aggregate_failures do
      sign_in event_responsible

      reference_point = event.reference_points.create! \
        name: 'R1',
        latitude: 20,
        longitude: 20
      assignment = event.reference_point_assignments.find_or_initialize_by(competitor: competitor, round: round)
      assignment.update!(reference_point: reference_point)

      params = {
        performance_competition_id: event.id,
        reference_point_assignment: {
          round_id: round.id,
          competitor_id: competitor.id,
          reference_point_id: nil
        }
      }

      expect { post :create, params: params, format: :json }.to \
        change { event.reference_point_assignments.count }.by(-1)

      expect(response).to be_successful
      expect(event.reference_point_assignments.find_by(competitor: competitor, round: round)).not_to be_present
    end

    it 'verifies permissions', :aggregate_failures do
      sign_in random_user

      params = {
        performance_competition_id: event.id,
        reference_point_assignment: {
          round_id: round.id,
          competitor_id: competitor.id,
          reference_point_id: nil
        }
      }

      post :create, params: params, format: :json

      expect(response).to be_forbidden
      expect(response.parsed_body).to eq({ 'error' => 'forbidden' })
    end
  end
end

describe Events::Rounds::ReferencePointAssignmentsController do
  describe 'regular user' do
    it '#create' do
      post :create, params: {
        event_id: event.id,
        round_id: round.id,
        competitor_id: competitor.id,
        reference_point_assignment: { reference_point_id: 1 }
      }

      expect(response.forbidden?).to be_truthy
    end

    it '#destroy' do
      delete :destroy, params: {
        event_id: event.id,
        round_id: round.id,
        competitor_id: competitor.id
      }

      expect(response.forbidden?).to be_truthy
    end
  end

  describe 'event organizer' do
    it '#create' do
      sign_in users(:event_responsible)

      post :create, params: {
        event_id: event.id,
        round_id: round.id,
        competitor_id: competitor.id,
        reference_point_assignment: { reference_point_id: 1 }
      }

      expect(response.successful?).to be_truthy
    end

    it '#destroy' do
      sign_in users(:event_responsible)

      delete :destroy, params: {
        event_id: event.id,
        round_id: round.id,
        competitor_id: competitor.id
      }

      expect(response.successful?).to be_truthy
    end
  end

  def event
    events(:published_public)
  end

  def round
    event_rounds(:distance_round_1)
  end

  def competitor
    event_competitors(:competitor_1)
  end
end

describe Events::ReferencePointsController do
  describe 'regular user' do
    it '#show' do
      get :show, params: { event_id: event.id }

      expect(response.forbidden?).to be_truthy
    end

    it '#update' do
      put :update, params: { event_id: event.id, event: { designated_lane_start: 1 } }

      expect(response.forbidden?).to be_truthy
    end
  end

  describe 'event organizer' do
    it '#show' do
      sign_in users(:event_responsible)

      get :show, params: { event_id: event.id }

      expect(response.successful?).to be_truthy
    end

    it '#update' do
      sign_in users(:event_responsible)

      put :update, params: { event_id: event.id, event: { designated_lane_start: 'designated_lane_start_on_5_sec' } }

      expect(response.redirect?).to be_truthy
    end
  end

  def event
    events(:published_public)
  end
end

describe Events::SectionsController do
  describe 'event organizer' do
    it 'updates section' do
      event = events(:published_public)
      section = event_sections(:speed_distance_time_advanced)

      sign_in users(:event_responsible)

      get :edit, params: { event_id: event.id, id: section.id }, xhr: true
      expect(response.successful?).to be_truthy
    end
  end
end

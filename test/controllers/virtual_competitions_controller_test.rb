describe VirtualCompetitionsController do
  describe 'regular user' do
    it '#index' do
      get :index

      expect(response.successful?).to be_truthy
    end

    it '#show redirects to overall' do
      travel_to Time.zone.parse('2018-01-01')
      virtual_competition = virtual_competitions(:base_race)

      get :show, params: { id: virtual_competition.id }

      expect(response.redirect?).to be_truthy
      expect(response.location).to eq(virtual_competition_year_url(virtual_competition.id, year: 2018))
    end

    it '#new' do
      get :new

      expect(response.forbidden?).to be_truthy
    end

    it '#create' do
      post :create, params: { virtual_competition: { name: 'New comp' } }

      expect(response.forbidden?).to be_truthy
    end

    it '#edit' do
      virtual_competition = virtual_competitions(:base_race)

      get :edit, params: { id: virtual_competition.id }

      expect(response.forbidden?).to be_truthy
    end

    it '#update' do
      virtual_competition = virtual_competitions(:base_race)

      patch :update, params: { id: virtual_competition.id, virtual_competition: { name: 'New name' } }

      expect(response.forbidden?).to be_truthy
    end

    it '#destroy' do
      virtual_competition = virtual_competitions(:base_race)

      delete :destroy, params: { id: virtual_competition.id }

      expect(response.forbidden?).to be_truthy
    end
  end
end

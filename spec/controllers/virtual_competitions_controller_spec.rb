describe VirtualCompetitionsController do
  describe 'regular user' do
    it '#index' do
      get :index

      expect(response.successful?).to be_truthy
    end

    it '#show redirects to overall' do
      virtual_competition = create :virtual_competition

      get :show, params: { id: virtual_competition.id }

      expect(response.redirect?).to be_truthy
      expect(response.location).to eq(virtual_competition_overall_url(virtual_competition.id))
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
      virtual_competition = create :virtual_competition

      get :edit, params: { id: virtual_competition.id }

      expect(response.forbidden?).to be_truthy
    end

    it '#update' do
      virtual_competition = create :virtual_competition

      patch :update, params: { id: virtual_competition.id, virtual_competition: { name: 'New name' } }

      expect(response.forbidden?).to be_truthy
    end

    it '#destroy' do
      virtual_competition = create :virtual_competition

      delete :destroy, params: { id: virtual_competition.id }

      expect(response.forbidden?).to be_truthy
    end
  end
end

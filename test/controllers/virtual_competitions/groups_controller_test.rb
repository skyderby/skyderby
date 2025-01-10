describe VirtualCompetitions::GroupsController do
  describe 'regular user' do
    it '#index' do
      get :index

      expect(response.forbidden?).to be_truthy
    end

    it '#show redirects to overall' do
      group = virtual_competition_groups(:main)

      get :show, params: { id: group.id }

      expect(response.forbidden?).to be_truthy
    end

    it '#new' do
      get :new

      expect(response.forbidden?).to be_truthy
    end

    it '#create' do
      post :create, params: { virtual_comp_group: { name: 'New group' } }

      expect(response.forbidden?).to be_truthy
    end

    it '#edit' do
      group = virtual_competition_groups(:main)

      get :edit, params: { id: group.id }

      expect(response.forbidden?).to be_truthy
    end

    it '#update' do
      group = virtual_competition_groups(:main)

      patch :update, params: { id: group.id, virtual_comp_group: { name: 'New name' } }

      expect(response.forbidden?).to be_truthy
    end

    it '#destroy' do
      group = virtual_competition_groups(:main)

      delete :destroy, params: { id: group.id }

      expect(response.forbidden?).to be_truthy
    end
  end
end

describe VirtualCompGroupsController do
  describe 'regular user' do
    it '#index' do
      get :index

      expect(response.forbidden?).to be_truthy
    end

    it '#show redirects to overall' do
      virtual_comp_group = create :virtual_comp_group

      get :show, params: { id: virtual_comp_group.id }

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
      virtual_comp_group = create :virtual_comp_group

      get :edit, params: { id: virtual_comp_group.id }

      expect(response.forbidden?).to be_truthy
    end

    it '#update' do
      virtual_comp_group = create :virtual_comp_group

      patch :update, params: { id: virtual_comp_group.id, virtual_comp_group: { name: 'New name' } }

      expect(response.forbidden?).to be_truthy
    end

    it '#destroy' do
      virtual_comp_group = create :virtual_comp_group

      delete :destroy, params: { id: virtual_comp_group.id }

      expect(response.forbidden?).to be_truthy
    end
  end
end

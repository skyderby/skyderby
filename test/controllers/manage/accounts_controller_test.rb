describe Manage::AccountsController do
  describe 'guest user' do
    it '#index not allowed' do
      get :index
      expect(response.forbidden?).to be_truthy
    end

    it '#show not allowed' do
      get :show, params: { id: users(:event_responsible).id }
      expect(response.forbidden?).to be_truthy
    end
  end

  describe 'admin user' do
    it '#index' do
      sign_in users(:admin)

      get :index

      expect(response.successful?).to be_truthy
    end

    it '#show' do
      sign_in users(:admin)

      get :show, params: { id: users(:admin).id }

      expect(response.successful?).to be_truthy
    end
  end
end

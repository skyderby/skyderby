describe ProfilesController, type: :controller do
  describe 'regular and guest user' do
    it '#index' do
      get :index

      expect(response.forbidden?).to be_truthy
    end

    it '#show' do
      profile = create :profile

      get :show, params: { id: profile.id }

      expect(response.successful?).to be_truthy
    end

    it '#edit' do
      profile = create :profile

      get :edit, params: { id: profile.id }

      expect(response.forbidden?).to be_truthy
    end

    it '#update' do
      profile = create :profile

      patch :update, params: { id: profile.id, name: 'SSSWWW' }

      expect(response.forbidden?).to be_truthy
    end

    it '#destroy' do
      profile = create :profile

      delete :destroy, params: { id: profile.id }

      expect(response.forbidden?).to be_truthy
    end
  end

  describe 'admin user' do
    it '#index' do
      login_admin

      get :index

      expect(response.successful?).to be_truthy
    end

    def login_admin
      @request.env['devise.mapping'] = Devise.mappings[:user]
      sign_in user
    end

    def user
      @user ||= create :user, :admin
    end
  end
end

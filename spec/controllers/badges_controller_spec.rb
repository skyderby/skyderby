describe BadgesController, type: :controller do
  describe 'regular user' do
    describe 'not allowed actions' do
      it '#index' do
        get :index

        expect(response.forbidden?).to be_truthy
      end

      it '#edit' do
        badge = create :badge

        get :edit, params: { id: badge.id }

        expect(response.forbidden?).to be_truthy
      end

      it '#update' do
        badge = create :badge
        patch :update, params: { id: badge.id, badge: { name: 'SSSWWW' } }

        expect(response.forbidden?).to be_truthy
      end

      it '#destroy' do
        badge = create :badge
        delete :destroy, params: { id: badge.id }

        expect(response.forbidden?).to be_truthy
      end
    end
  end

  describe 'admin user' do
    it '#edit' do
      login_admin
      badge = create :badge

      get :edit, params: { id: badge.id }, xhr: true

      expect(response.successful?).to be_truthy
    end

    it '#update' do
      login_admin
      badge = create :badge

      patch :update, params: { id: badge.id, badge: { name: 'SSSWWW' } }, format: :js

      expect(response.successful?).to be_truthy
    end

    it '#destroy' do
      login_admin
      badge = create :badge

      delete :destroy, params: { id: badge.id }, format: :js

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

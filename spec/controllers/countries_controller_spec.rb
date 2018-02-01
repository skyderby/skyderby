describe CountriesController, type: :controller do
  describe 'regular user' do
    describe 'not allowed actions' do
      it '#index' do
        get :index

        expect(response.forbidden?).to be_truthy
      end

      it '#show' do
        country = create :country

        get :show, params: { id: country.id }

        expect(response.forbidden?).to be_truthy
      end

      it '#new' do
        get :new

        expect(response.forbidden?).to be_truthy
      end

      it '#edit' do
        country = create :country

        get :edit, params: { id: country.id }

        expect(response.forbidden?).to be_truthy
      end

      it '#create' do
        post :create, params: { country: { name: 'SSSWWW' } }

        expect(response.forbidden?).to be_truthy
      end

      it '#update' do
        country = create :country
        patch :update, params: { id: country.id, country: { name: 'SSSWWW' } }

        expect(response.forbidden?).to be_truthy
      end

      it '#destroy' do
        country = create :country
        delete :destroy, params: { id: country.id }

        expect(response.forbidden?).to be_truthy
      end
    end
  end

  describe 'admin user' do
    it '#new' do
      login_admin

      get :new

      expect(response.success?).to be_truthy
    end

    it '#edit' do
      login_admin
      country = create :country

      get :edit, params: { id: country.id }

      expect(response.success?).to be_truthy
    end

    it '#create' do
      login_admin

      post :create, params: { country: { name: 'SSSWWW', code: 'SWW' } }

      expect(response.redirect?).to be_truthy
      expect(response.location).to start_with(countries_url)
    end

    it '#update' do
      login_admin
      country = create :country

      patch :update, params: { id: country.id, country: { name: 'SSSWWW' } }

      expect(response.redirect?).to be_truthy
      expect(response.location).to start_with(countries_url)
    end

    it '#destroy' do
      login_admin
      country = create :country

      delete :destroy, params: { id: country.id }

      expect(response.redirect?).to be_truthy
      expect(response.location).to eq(countries_url)
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

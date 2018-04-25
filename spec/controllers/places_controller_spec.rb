describe PlacesController, type: :controller do
  describe 'regular user' do
    describe 'allowed actions' do
      it '#index' do
        get :index

        expect(response.successful?).to be_truthy
      end

      it '#show' do
        place = create :place

        get :show, params: { id: place.id }

        expect(response.successful?).to be_truthy
      end
    end

    describe 'not allowed actions' do
      it '#new' do
        get :new

        expect(response.forbidden?).to be_truthy
      end

      it '#edit' do
        place = create :place

        get :edit, params: { id: place.id }

        expect(response.forbidden?).to be_truthy
      end

      it '#create' do
        post :create, params: { place: { name: 'SSSWWW' } }

        expect(response.forbidden?).to be_truthy
      end

      it '#update' do
        place = create :place
        patch :update, params: { id: place.id, place: { name: 'SSSWWW' } }

        expect(response.forbidden?).to be_truthy
      end

      it '#destroy' do
        place = create :place
        delete :destroy, params: { id: place.id }

        expect(response.forbidden?).to be_truthy
      end
    end
  end

  describe 'admin user' do
    it '#new' do
      login_admin

      get :new

      expect(response.successful?).to be_truthy
    end

    it '#edit' do
      login_admin
      place = create :place

      get :edit, params: { id: place.id }

      expect(response.successful?).to be_truthy
    end

    it '#create' do
      login_admin

      post :create, params: { place: { name: 'SSSWWW' } }

      expect(response.successful?).to be_truthy
    end

    it '#update' do
      login_admin
      place = create :place

      patch :update, params: { id: place.id, place: { name: 'SSSWWW' } }

      expect(response.redirect?).to be_truthy
      expect(response.location).to eq(places_url)
    end

    it '#destroy' do
      login_admin
      place = create :place

      delete :destroy, params: { id: place.id }

      expect(response.redirect?).to be_truthy
      expect(response.location).to eq(places_url)
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

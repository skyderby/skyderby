describe Api::V1::SpeedSkydivingCompetitionsController do
  let(:event) { speed_skydiving_competitions(:nationals) }

  describe '#show' do
    it 'forbidden when user does not have access' do
      user = create(:user)
      sign_in user
      event.draft!

      get :show, params: { id: event.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end
  end

  describe '#create' do
    let(:place) { places(:ravenna) }
    let(:form_data) { { name: 'Test event', starts_at: Time.zone.today, place_id: place.id } }
    let(:params) { { speed_skydiving_competition: form_data } }

    subject(:perform_request) { post :create, params: params, format: :json }

    it 'forbidden for guest users / not logged in' do
      expect { perform_request }.not_to(change { SpeedSkydivingCompetition.count })

      expect(response).to have_http_status(:forbidden)
    end

    it 'success when user is authorized' do
      user = users(:regular_user)
      sign_in user

      expect { perform_request }.to(change { SpeedSkydivingCompetition.count }.by(1))

      expect(response).to have_http_status(:success)
    end
  end
end

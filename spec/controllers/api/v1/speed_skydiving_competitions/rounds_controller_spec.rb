describe Api::V1::SpeedSkydivingCompetitions::RoundsController do
  render_views

  let(:event) { speed_skydiving_competitions(:nationals) }
  let(:user) { users(:regular_user) }
  let(:round_attributes) do
    hash_including(
      'id',
      'number',
      'completed',
      'createdAt',
      'updatedAt'
    )
  end

  describe '#index' do
    it 'forbidden if user does not have access to event' do
      event.draft!

      get :index, params: { speed_skydiving_competition_id: event.id }, format: :json

      expect(response).to have_http_status(:forbidden)
    end

    it 'responds with rounds if user have access' do
      sign_in user

      event.published!
      event.competitors.create!(profile: user.profile, category: event.categories.first)

      get :index, params: { speed_skydiving_competition_id: event.id }, format: :json

      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to all(match(round_attributes))
    end
  end

  describe '#create' do
    subject do
      post :create, params: { speed_skydiving_competition_id: event.id }, format: :json
    end

    it 'forbidden if user does not have permissions' do
      sign_in user

      expect { subject }.not_to(change { event.rounds.count })

      expect(response).to have_http_status(:forbidden)
    end

    it 'rejected if event finished' do
      sign_in event.responsible
      event.finished!

      expect { subject }.not_to(change { event.rounds.count })

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body).to match(hash_including('errors' => hash_including('base')))
    end

    it 'responds with newly created round' do
      sign_in event.responsible
      event.rounds.delete_all

      expect { subject }.to(change { event.rounds.count }.by(1))

      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to match(round_attributes)
      expect(response.parsed_body['number']).to eq(1)
    end
  end

  describe '#update' do
    let(:round) { event.rounds.find_by(number: 1) }
    let(:round_params) { { round: { completed: true } } }
    let(:params) { { speed_skydiving_competition_id: event.id, id: round.id }.merge(round_params) }

    subject do
      put :update, params: params, format: :json
    end

    it 'forbidden if user does not have permissions' do
      sign_in user

      expect { subject }.not_to(change { round.reload.completed_at })

      expect(response).to have_http_status(:forbidden)
    end

    it 'rejected if event finished' do
      sign_in event.responsible
      event.finished!

      expect { subject }.not_to(change { round.reload.completed_at })

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body).to match(hash_including('errors' => hash_including('base')))
    end

    it 'responds with updated round' do
      sign_in event.responsible

      expect { subject }.to(change { round.reload.completed }.to(true))

      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to match(round_attributes)
      expect(response.parsed_body['completed']).to eq(true)
    end
  end

  describe '#destroy' do
    let(:round) { event.rounds.find_by(number: 7) }
    let(:params) { { speed_skydiving_competition_id: event.id, id: round.id } }

    subject do
      delete :destroy, params: params, format: :json
    end

    it 'forbidden if user does not have permissions' do
      sign_in user

      expect { subject }.not_to(change { event.rounds.count })

      expect(response).to have_http_status(:forbidden)
    end

    it 'rejected if event finished' do
      sign_in event.responsible
      event.finished!

      expect { subject }.not_to(change { event.rounds.count })

      expect(response).to have_http_status(:unprocessable_entity)
      expect(response.parsed_body).to match(hash_including('errors' => hash_including('base')))
    end

    it 'responds with updated round' do
      sign_in event.responsible

      expect { subject }.to(change { event.rounds.count }.by(-1))

      expect(response).to have_http_status(:success)
      expect(response.parsed_body).to match(round_attributes)
    end
  end
end

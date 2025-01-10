describe TournamentsController do
  describe 'reqular user' do
    it '#show redirects to qualification if no rounds' do
      tournament = tournaments(:qualification_loen)

      get :show, params: { id: tournament.id }

      expect(response.redirect?).to be_truthy
      expect(response.location).to eq(tournament_qualification_url(tournament))
    end
  end

  describe 'organizer' do
    it '#show' do
      sign_in users(:regular_user)

      tournament = tournaments(:qualification_loen)

      get :show, params: { id: tournament.id }

      expect(response.successful?).to be_truthy
    end
  end
end

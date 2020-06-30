describe VirtualCompetitions::PeriodsController do
  it 'redirects if competition is not using custom intervals' do
    online_competition = virtual_competitions(:base_race)
    online_competition.annual!

    get :show, params: { virtual_competition_id: online_competition.id, id: '1st-week' }

    expect(response).to redirect_to(virtual_competition_path(online_competition.id))
  end
end

describe VirtualCompetitions::YearController do
  it 'redirects if competition is not annual' do
    online_competition = virtual_competitions(:base_race)
    online_competition.custom_intervals!

    get :show, params: { virtual_competition_id: online_competition.id, id: 2020 }

    expect(response).to redirect_to(virtual_competition_path(online_competition.id))
  end
end

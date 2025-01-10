describe Events::Rounds::MapsController do
  it '#show' do
    event = events(:nationals)
    round = event_rounds(:distance_1)

    get :show, params: { event_id: event.id, round_id: round.id }

    expect(response).to be_successful
  end
end

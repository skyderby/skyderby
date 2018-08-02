describe Events::Rounds::GlobeController do
  it '#show' do
    event = events(:published_public)
    round = event_rounds(:distance_round_1)

    get :show, params: { event_id: event.id, round_id: round.id }

    expect(response.successful?).to be_truthy
  end
end

describe Events::ScoreboardsController do
  it '#show, format: :html' do
    event = events(:published_public)

    get :show, params: { event_id: event.id }

    expect(response.redirect?).to be_truthy
    expect(response.location).to eq(event_url(event))
  end
end

describe Api::V1::Places::StatsController do
  render_views

  it 'when there is no jumps made' do
    place = Place.create! \
      name: 'Borki',
      country: countries(:russia),
      latitude: 56.7983919982,
      longitude: 37.3312257975,
      msl: 127

    get :show, format: :json, params: { place_id: place.id }

    expect(response.parsed_body['popularTimes'].keys).to eq((1..12).map(&:to_s))
    expect(response.parsed_body['popularTimes'].values).to all(eq({ 'trackCount' => 0, 'peopleCount' => 0 }))
  end

  it 'when there are jumps', :aggregate_failures do
    place = Place.create! \
      name: 'Borki',
      country: countries(:russia),
      latitude: 56.7983919982,
      longitude: 37.3312257975,
      msl: 127

    profile = Profile.create! name: 'Athlete', country: countries(:russia)

    create_list :empty_track, 1, place: place, recorded_at: Date.parse('2022-02-20')
    create_list :empty_track, 3, place: place, recorded_at: Date.parse('2022-03-20')
    create_list :empty_track, 2, place: place, pilot: profile, recorded_at: Date.parse('2022-04-20')

    get :show, format: :json, params: { place_id: place.id }

    expect(response.parsed_body['popularTimes'].keys).to eq((1..12).map(&:to_s))
    expect(response.parsed_body.dig('popularTimes', '2')).to eq({ 'trackCount' => 1, 'peopleCount' => 1 })
    expect(response.parsed_body.dig('popularTimes', '3')).to eq({ 'trackCount' => 3, 'peopleCount' => 3 })
    expect(response.parsed_body.dig('popularTimes', '4')).to eq({ 'trackCount' => 2, 'peopleCount' => 1 })
    expect(response.parsed_body['lastTrackRecordedAt']).to eq('2022-04-20T00:00:00Z')
  end
end

describe Events::Scoreboards::SpeedDistanceTime do
  it '#sections' do
    event = events(:published_public)
    params = Events::Scoreboards::Params.new(event, {})

    scoreboard = Events::Scoreboards.for(event, params)

    sections = scoreboard.sections.map(&:name)
    expect(sections).to eq(['Advanced', 'Intermediate'])
  end
end

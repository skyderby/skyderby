describe Events::Scoreboards::SpeedDistanceTime do
  it '#sections' do
    event = events(:published_public)

    scoreboard = Events::Scoreboards.for(event, false)

    sections = scoreboard.sections.map(&:name)
    expect(sections).to eq(['Advanced', 'Intermediate'])
  end
end

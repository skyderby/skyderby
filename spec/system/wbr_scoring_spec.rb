feature 'WBR: Scoring tracks', type: :system do
  scenario 'Competitor intersected finish line' do
    tournament = build_tournament
    round = tournament.rounds.create!
    match = round.matches.create!(start_time: '2015-07-02 11:45:38.185')

    match_competitor = match.slots.create!(
      track: create_track_from_file('WBR/11-40-01_Ratmir.CSV')
    )

    expect(match_competitor.result).to be_within(0.001).of(33.543)
  end

  scenario 'Another competitor intersected finish line' do
    tournament = build_tournament
    round = tournament.rounds.create!
    match = round.matches.create!(start_time: '2015-07-02 13:46:11.447')

    match_competitor = match.slots.create!(
      track: create_track_from_file('WBR/13-35-43_Andreas.CSV')
    )

    expect(match_competitor.result).to be_within(0.001).of(32.822)
  end

  scenario 'Competitor did not intersect finish line' do
    tournament = build_tournament
    round = tournament.rounds.create!
    match = round.matches.create!(start_time: '2015-07-03 11:10:30.450')

    match_competitor = match.slots.create!(
      track: create_track_from_file('WBR/11-05-01_Ratmir.CSV')
    )

    expect(match_competitor.result).to eq(0)
    expect(match_competitor.is_disqualified).to be_truthy
    expect(match_competitor.notes).to eq("Didn't intersected finish line")
  end

  def build_tournament
    Tournament.create!(
      name: 'WBR',
      finish_start_lat: 62.053858,
      finish_start_lon: 6.945123,
      finish_end_lat: 62.056071,
      finish_end_lon: 6.945568,
      exit_lat: 62.0578307,
      exit_lon: 6.9715718
    )
  end
end

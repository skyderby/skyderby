require 'spec_helper'

feature 'WBR: Scoring tracks' do
  scenario 'Competitor intersected finish line' do
    tournament = build_tournament
    round = tournament.rounds.create!
    match = round.matches.create!(start_time: '2015-07-02 11:45:38.185')

    match_competitor = match.slots.create!(
      track: create_track_from_file('WBR/11-40-01_Ratmir.CSV')
    )

    expect(match_competitor.result).to be_within(0.001).of(33.580)
  end

  scenario 'Another competitor intersected finish line' do
    tournament = build_tournament
    round = tournament.rounds.create!
    match = round.matches.create!(start_time: '2015-07-02 13:46:11.447')

    match_competitor = match.slots.create!(
      track: create_track_from_file('WBR/13-35-43_Andreas.CSV')
    )

    expect(match_competitor.result).to be_within(0.001).of(32.828)
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

  def create_track_from_file(filename)
    pilot = create :pilot
    suit = create :wingsuit

    track_file = TrackFile.create(
      file: File.new("#{Rails.root}/spec/support/tracks/#{filename}")
    )

    params = {
      track_file_id: track_file.id,
      pilot: pilot,
      user: pilot.user,
      wingsuit: suit
    }
    CreateTrackService.new(params).execute
  end
end

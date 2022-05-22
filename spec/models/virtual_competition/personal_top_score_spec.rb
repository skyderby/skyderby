describe VirtualCompetition::PersonalTopScore do
  let(:competition) { virtual_competitions :distance_in_time }

  before do
    profile = profiles(:competitor_1)
    3.times do |index|
      track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2015-01-03') + index.years
      competition.results.create(track: track, result: 100 * (index + 1))
      competition.results.create(track: track, result: 90 * (index + 1), wind_cancelled: true)
    end

    profile = profiles(:competitor_2)
    3.times do |index|
      track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2015-01-03') + index.years
      competition.results.create(track: track, result: 70 * (index + 1))
      competition.results.create(track: track, result: 60 * (index + 1), wind_cancelled: true)
    end
  end

  it 'return correct non wind cancelled results' do
    results = competition.personal_top_scores.wind_cancellation(false)

    expect(results.count).to eq(2)
    expect(results.first.result).to eq(300)
    expect(results.second.result).to eq(210)
  end

  it 'return correct wind cancelled results' do
    results = competition.personal_top_scores.wind_cancellation(true)

    expect(results.count).to eq(2)
    expect(results.first.result).to eq(270)
    expect(results.second.result).to eq(180)
  end
end

describe VirtualCompetition::PersonalTopScore do
  subject do
    competition = virtual_competitions :distance_in_time

    profile = profiles(:competitor_1)
    3.times do |index|
      track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2015-01-03') + index.years
      competition.results.create(track: track, result: 100 * (index + 1))
    end

    profile = profiles(:competitor_2)
    3.times do |index|
      track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2015-01-03') + index.years
      competition.results.create(track: track, result: 70 * (index + 1))
    end

    competition
  end

  it 'return correct results' do
    results = subject.personal_top_scores

    expect(results.count).to eq(2)
    expect(results.first.result).to eq(300)
    expect(results.second.result).to eq(210)
  end
end

describe VirtualCompetition::IntervalTopScore do
  subject do
    competition = virtual_competitions :base_race
    competition.custom_intervals!

    competition.custom_intervals.create!(
      name: '1st month',
      period_from: Time.zone.parse('2016-01-01'),
      period_to: Time.zone.parse('2016-01-31')
    )

    profile = profiles(:competitor_1)
    3.times do |index|
      track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2016-01-03')
      competition.results.create(track: track, result: 100 * (index + 1))
    end

    competition
  end

  it '#for' do
    interval = subject.custom_intervals.find_by(name: '1st month')
    results = subject.interval_top_scores.for(interval)

    expect(results.count).to eq(1)
    expect(results.first.result).to eq(100)
  end
end

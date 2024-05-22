describe VirtualCompetition::AnnualTopScore do
  let!(:competition) { virtual_competitions(:skydive_distance_wingsuit) }
  let(:profile) { profiles(:competitor_1) }

  before do
    track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2015-02-02')
    competition.results.create(track: track, result: 2200)
    competition.results.create(track: track, result: 2000, wind_cancelled: true)

    track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2016-02-02')
    competition.results.create(track: track, result: 3000)
    competition.results.create(track: track, result: 2400, wind_cancelled: true)

    track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2017-01-08')
    competition.results.create(track: track, result: 5000)
    competition.results.create(track: track, result: 4500, wind_cancelled: true)
  end

  describe 'with wind_cancellation enabled' do
    it 'takes best result only in chosen year' do
      results = competition.annual_top_scores.wind_cancellation(true).where(year: 2016)

      expect(results.count).to eq(1)
      expect(results.first.result).to eq(2400)
    end
  end

  describe 'with wind_cancellation disabled' do
    it 'takes best result only in chosen year' do
      results = competition.annual_top_scores.wind_cancellation(true).where(year: 2017)

      expect(results.count).to eq(1)
      expect(results.first.result).to eq(4500)
    end
  end
end

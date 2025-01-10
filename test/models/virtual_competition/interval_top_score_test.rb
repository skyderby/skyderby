describe VirtualCompetition::IntervalTopScore do
  describe 'with wind_cancellation enabled' do
    describe 'when less is better (ascending order)' do
      let!(:competition) { virtual_competitions(:base_race).tap(&:custom_intervals) }
      let!(:previous_interval) do
        competition.custom_intervals.create!(
          name: '1st month',
          period_from: Time.zone.parse('2016-01-01'),
          period_to: Time.zone.parse('2016-01-31')
        )
      end
      let!(:current_interval) do
        competition.custom_intervals.create!(
          name: '2nd month',
          period_from: Time.zone.parse('2016-02-01'),
          period_to: Time.zone.parse('2016-02-28')
        )
      end
      let(:profile) { profiles(:competitor_1) }

      before do
        3.times do |index|
          track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2016-02-02')
          competition.results.create(track: track, result: 100 * (index + 1))
        end

        track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2016-01-08')
        competition.results.create(track: track, result: 50)
      end

      it 'takes best result only in current interval' do
        results = competition.interval_top_scores.for(current_interval).wind_cancellation(false)

        expect(results.count).to eq(1)
        expect(results.first.result).to eq(100)
      end
    end

    describe 'when more is better (descending order)' do
      let!(:competition) { virtual_competitions(:skydive_distance).tap(&:custom_intervals) }
      let!(:previous_interval) do
        competition.custom_intervals.create!(
          name: '1st month',
          period_from: Time.zone.parse('2016-01-01'),
          period_to: Time.zone.parse('2016-01-31')
        )
      end
      let!(:current_interval) do
        competition.custom_intervals.create!(
          name: '2nd month',
          period_from: Time.zone.parse('2016-02-01'),
          period_to: Time.zone.parse('2016-02-28')
        )
      end
      let(:profile) { profiles(:competitor_1) }

      before do
        3.times do |index|
          track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2016-02-02')
          competition.results.create(track: track, result: 1000 * (index + 1))
        end

        track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2016-01-08')
        competition.results.create(track: track, result: 5000)
      end

      it 'takes best result only in current interval' do
        results = competition.interval_top_scores.for(current_interval).wind_cancellation(false)

        expect(results.count).to eq(1)
        expect(results.first.result).to eq(3000)
      end
    end
  end

  describe 'with wind_cancellation enabled' do
    let!(:competition) { virtual_competitions(:skydive_distance).tap(&:custom_intervals) }
    let!(:previous_interval) do
      competition.custom_intervals.create!(
        name: '1st month',
        period_from: Time.zone.parse('2016-01-01'),
        period_to: Time.zone.parse('2016-01-31')
      )
    end
    let!(:current_interval) do
      competition.custom_intervals.create!(
        name: '2nd month',
        period_from: Time.zone.parse('2016-02-01'),
        period_to: Time.zone.parse('2016-02-28')
      )
    end
    let(:profile) { profiles(:competitor_1) }

    before do
      3.times do |index|
        track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2016-02-02')
        competition.results.create(track: track, result: 1000 * (index + 1))
        competition.results.create(track: track, result: 800 * (index + 1), wind_cancelled: true)
      end

      track = create :empty_track, pilot: profile, recorded_at: Time.zone.parse('2016-01-08')
      competition.results.create(track: track, result: 5000)
    end

    it 'takes best result only in current interval' do
      results = competition.interval_top_scores.for(current_interval).wind_cancellation(true)

      expect(results.count).to eq(1)
      expect(results.first.result).to eq(2400)
    end
  end
end

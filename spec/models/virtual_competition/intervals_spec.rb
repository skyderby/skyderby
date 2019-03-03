describe VirtualCompetition::Intervals do
  describe 'Annual' do
    subject { virtual_competitions(:base_race) }

    it 'returns years from start to current' do
      travel_to Time.zone.parse('2017-01-01')

      expect(subject.years).to eq([2015, 2016, 2017])
    end
  end

  describe 'Custom intervals' do
    subject do
      competition = virtual_competitions(:base_race)
      competition.custom_intervals!

      competition.tap do |record|
        record.custom_intervals.create(
          name: '1st week',
          period_from: Time.zone.parse('2018-01-01 00:00:00'),
          period_to: Time.zone.parse('2018-01-07 23:59:59')
        )

        record.custom_intervals.create(
          name: '2nd week',
          period_from: Time.zone.parse('2018-01-08 00:00:00'),
          period_to: Time.zone.parse('2018-01-15 23:59:59')
        )

        record.custom_intervals.create(
          name: '3rd week',
          period_from: Time.zone.parse('2018-01-16 00:00:00'),
          period_to: Time.zone.parse('2018-01-21 23:59:59')
        )
      end
    end

    it '#last_interval before start' do
      travel_to Time.zone.parse('2017-01-01')
      expect(subject.last_interval).to be_blank
    end

    it '#last_interval when in the middle' do
      travel_to Time.zone.parse('2018-01-09')
      expect(subject.last_interval.name).to eq('2nd week')
    end

    it '#last_interval after end' do
      travel_to Time.zone.parse('2019-01-01')
      expect(subject.last_interval.name).to eq('3rd week')
    end

    it '#intervals before start' do
      travel_to Time.zone.parse('2017-01-01')
      expect(subject.intervals.map(&:name)).to be_blank
    end

    it '#intervals when in the middle' do
      travel_to Time.zone.parse('2018-01-09')
      expect(subject.intervals.map(&:name)).to match_array(['1st week', '2nd week'])
    end

    it '#intervals after end' do
      travel_to Time.zone.parse('2019-01-01')
      expect(subject.intervals.map(&:name)).to match_array(['1st week', '2nd week', '3rd week'])
    end
  end
end

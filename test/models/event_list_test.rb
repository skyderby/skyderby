describe EventList do
  let(:responsible) { users(:event_responsible) }

  describe 'PerformanceCompetitionSeries' do
    before do
      PerformanceCompetitionSeries.create! \
        name: 'Empty one',
        responsible: responsible

      PerformanceCompetitionSeries.create!(
        name: 'With two locations',
        responsible: responsible
      ).tap do |series|
        series.competitions << Event.create!(
          name: 'First location',
          responsible: responsible,
          starts_at: '2022-04-15'
        ).tap do |event|
          category = event.sections.create!(name: 'Open')
          event.competitors.create!(
            section: category,
            profile: profiles(:alex),
            suit: suits(:apache)
          )
        end

        series.competitions << Event.create!(
          name: 'Second location',
          responsible: responsible,
          starts_at: '2022-04-24'
        ).tap do |event|
          category = event.sections.create!(name: 'Open')
          event.competitors.create!(
            section: category,
            profile: profiles(:competitor_1),
            suit: suits(:apache)
          )
        end
      end
    end

    subject(:records) { EventList.where(event_type: 'PerformanceCompetitionSeries') }

    it 'contains 2 records' do
      expect(records.count).to eq 2
    end

    it 'empty one have correct attributes', :aggregate_failures do
      series = records.find { |r| r.name == 'Empty one' }

      expect(series).not_to be_nil
      expect(series.starts_at).to be_nil
      expect(series.country_ids).to be_nil
      expect(series.competitors_count).to be_nil
    end

    it 'series with two locations have correct attributes', :aggregate_failures do
      series = records.find { |r| r.name == 'With two locations' }

      expect(series).not_to be_nil
      expect(series.starts_at).to eq(Time.zone.parse('2022-04-15'))
      expect(series.competitors_count).to match('First location' => 1, 'Second location' => 1)
      expect(series.country_ids.count).to eq(1)
    end
  end
end

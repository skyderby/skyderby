describe PerformanceCompetitionSeries::Scoreboard do
  describe '#categories' do
    let(:responsible) { users(:event_responsible) }
    let(:series) { PerformanceCompetitionSeries.create!(name: 'Series', responsible: responsible) }

    it 'group categories by name' do
      series.competitions << Event.create!(
        name: 'First',
        responsible: responsible,
        starts_at: '2022-04-20'
      ).tap do |event|
        event.sections.create!(name: 'open')
        event.sections.create!(name: 'intermediate')
      end

      series.competitions << Event.create!(
        name: 'Second',
        responsible: responsible,
        starts_at: '2022-04-20'
      ).tap do |event|
        event.sections.create!(name: 'OPEN')
      end

      categories = described_class.new(series, {}).categories

      expect(categories.map { _1.name.downcase }).to eq(%w[open intermediate])
    end
  end
end

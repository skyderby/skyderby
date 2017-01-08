describe GfsGradsFetcher::Dataset do
  describe 'Dataset.for' do
    it 'raise error if date outside of +/- 5 days range from today' do
      expect { GfsGradsFetcher::Dataset.for(DateTime.current + 6.days) }
        .to raise_error(GfsGradsFetcher::Dataset::DateOutOfRange)
    end

    it 'returns dataset for current time if requested date in future' do
      allow_any_instance_of(GfsGradsFetcher::Dataset)
        .to receive(:available?)
        .and_return(true)

      future_dataset = GfsGradsFetcher::Dataset.for(DateTime.current + 1.day)
      today_dataset = GfsGradsFetcher::Dataset.for(DateTime.current)

      expect(future_dataset.name).to eq(today_dataset.name)
    end

    it 'raise error if previous dataset not available' do
      allow_any_instance_of(GfsGradsFetcher::Dataset)
        .to receive(:available?)
        .and_return(false)

      expect { GfsGradsFetcher::Dataset.for(DateTime.current) }
        .to raise_error(GfsGradsFetcher::Dataset::NoDatasetAvailable)
    end
  end

  describe 'instance interface' do
    before do
      allow_any_instance_of(GfsGradsFetcher::Dataset)
        .to receive(:available?)
        .and_return(true)
    end

    it '#name' do
      dataset = GfsGradsFetcher::Dataset.for(Time.zone.parse('2017-01-07T01:00:00'))
      expect(dataset.name).to eq 'gfs_0p25_1hr/gfs20170107/gfs_0p25_1hr_00z'
    end

    it '#start_time' do
      dataset = GfsGradsFetcher::Dataset.for(Time.zone.parse('2017-01-07T01:00:00'))
      expect(dataset.start_time).to eq Time.zone.parse('2017-01-07T00:00:00')
    end

    it '#url' do
      dataset = GfsGradsFetcher::Dataset.for(Time.zone.parse('2017-01-07T01:00:00'))
      expect(dataset.url).to eq(
        'http://nomads.ncep.noaa.gov/dods/' \
        'gfs_0p25_1hr/gfs20170107/gfs_0p25_1hr_00z.asc'
      )
    end
  end
end

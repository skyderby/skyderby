describe GfsGradsFetcher::Dataset do
  describe 'Dataset.for' do
    it 'raise error if date outside of +/- 5 days range from today' do
      expect { GfsGradsFetcher::Dataset.for(6.days.from_now) }
        .to raise_error(GfsGradsFetcher::Dataset::DateOutOfRange)
    end

    it 'returns dataset for current time if requested date in future' do
      allow_any_instance_of(GfsGradsFetcher::Dataset)
        .to receive(:available?)
        .and_return(true)

      future_dataset = GfsGradsFetcher::Dataset.for(1.day.from_now)
      today_dataset = GfsGradsFetcher::Dataset.for(Time.current)

      expect(future_dataset.name).to eq(today_dataset.name)
    end

    it 'raise error if previous dataset not available' do
      allow_any_instance_of(GfsGradsFetcher::Dataset)
        .to receive(:available?)
        .and_return(false)

      expect { GfsGradsFetcher::Dataset.for(Time.current) }
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
      requested_time = Time.current.beginning_of_day + 1.hour
      dataset = GfsGradsFetcher::Dataset.for(requested_time)
      expect(dataset.name).to eq "gfs_0p25_1hr/gfs#{requested_time.strftime('%Y%m%d')}/gfs_0p25_1hr_00z"
    end

    it '#start_time' do
      requested_time = Time.current.beginning_of_day + 1.hour
      dataset = GfsGradsFetcher::Dataset.for(requested_time)
      expect(dataset.start_time).to eq requested_time.beginning_of_day
    end

    it '#url' do
      requested_time = Time.current.beginning_of_day + 1.hour
      dataset = GfsGradsFetcher::Dataset.for(requested_time)
      expect(dataset.url).to eq(
        'https://nomads.ncep.noaa.gov/dods/' \
        "gfs_0p25_1hr/gfs#{requested_time.strftime('%Y%m%d')}/gfs_0p25_1hr_00z.asc"
      )
    end
  end
end

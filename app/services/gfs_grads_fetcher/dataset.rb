class GfsGradsFetcher
  class Dataset
    DATASETS_INTERVAL = 6
    DATASETS_HISTORY_DAYS = 12
    DAYS_IN_DATASET = 5
    SERVICE_URL = 'https://nomads.ncep.noaa.gov/dods'.freeze

    class DateOutOfRange      < StandardError; end

    class NoDatasetAvailable  < StandardError; end

    class UnknownAvailability < StandardError; end

    def initialize(opts = {})
      @date_time = opts[:date_time]
    end

    def available?
      response = Net::HTTP.get(URI.parse(url(ext: 'info')))

      if response.include?("#{name} is not an available dataset") ||
         response.include?('extraction failed; not enough lat data')
        false
      elsif response.include? "GrADS Data Server - info for /#{name}"
        true
      else
        raise UnknownAvailability, "Respone is #{response}"
      end
    end

    def url(ext: 'asc')
      "#{SERVICE_URL}/#{name}.#{ext}"
    end

    def name
      # date in url example - 20170228
      date_param = date_time.strftime('%Y%m%d')
      "gfs_0p25_1hr/gfs#{date_param}/gfs_0p25_1hr_#{time_offset}z"
    end

    def start_time
      Time.zone.parse("#{date_time.strftime('%Y-%m-%d')}T#{time_offset}:00:00")
    end

    def self.for(date_time)
      today = Date.current
      date_range = (today - DATASETS_HISTORY_DAYS)..(today + DAYS_IN_DATASET)
      raise DateOutOfRange unless date_range.cover? date_time.to_date

      dataset_date_time = date_time > Time.current ? Time.current : date_time
      dataset = new(date_time: dataset_date_time)
      return dataset if dataset.available?

      dataset = new(date_time: dataset_date_time - DATASETS_INTERVAL.hours)
      return dataset if dataset.available?

      raise NoDatasetAvailable
    end

    private

    # time_offset values - 00, 06, 12, 18
    def time_offset
      current_hour = date_time.hour
      format('%02d', current_hour - (current_hour % DATASETS_INTERVAL))
    end

    attr_reader :date_time
  end
end

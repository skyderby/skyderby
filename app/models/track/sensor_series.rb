class Track::SensorSeries < ApplicationRecord
  self.table_name = 'track_sensor_series'
  self.primary_key = 'track_id'

  belongs_to :track, inverse_of: :sensor_series

  attribute :gps_time, ArrayColumn::Time.new
  %i[ax ay az].each { |column| attribute column, ArrayColumn::Float.new }

  def self.record(track, samples)
    return where(track:).delete_all if samples.empty?

    upsert( # rubocop:disable Rails/SkipsModelValidations
      {
        track_id: track.id,
        gps_time: samples.map { |sample| Time.zone.at(sample.gps_time) },
        ax: samples.map(&:ax),
        ay: samples.map(&:ay),
        az: samples.map(&:az)
      },
      unique_by: :track_id
    )
  end

  def samples
    @samples ||= gps_time.each_index.map do |index|
      SensorParser::Flysight2::Sample.new(gps_time: gps_time[index].to_f, ax: ax[index], ay: ay[index], az: az[index])
    end
  end
end

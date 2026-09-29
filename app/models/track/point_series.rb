class Track::PointSeries
  COLUMNS = %i[
    gps_time latitude longitude abs_altitude h_speed v_speed distance fl_time
    horizontal_accuracy vertical_accuracy speed_accuracy
  ].freeze

  attr_reader :track

  def initialize(track)
    @track = track
  end

  def count = rows.size

  def columns
    @columns ||= COLUMNS.zip(rows.transpose.presence || Array.new(COLUMNS.size) { [] }).to_h
  end

  private

  def rows
    @rows ||= track.points.reorder(:gps_time_in_seconds).pluck(*select_list).map do |row|
      row.map { |value| value&.to_f }
    end
  end

  def select_list
    altitude = track.abs_altitude? ? 'abs_altitude' : 'elevation'

    [
      :gps_time_in_seconds, :latitude, :longitude, Arel.sql(altitude), :h_speed, :v_speed, :distance, :fl_time,
      :horizontal_accuracy, :vertical_accuracy, :speed_accuracy
    ]
  end
end

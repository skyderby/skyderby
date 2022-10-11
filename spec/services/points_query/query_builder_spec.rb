describe PointsQuery::QueryBuilder do
  it 'returns array of all fields unless only option specified' do
    query_builder = PointsQuery::QueryBuilder.new(track)
    expect(query_builder.execute).to eq(
      [
        'to_timestamp(gps_time_in_seconds) AT TIME ZONE \'UTC\' as gps_time',
        'gps_time_in_seconds - 0.0 AS fl_time',
        'abs_altitude',
        'abs_altitude - 0 AS altitude',
        'latitude',
        'longitude',
        'h_speed',
        'v_speed',
        'distance',
        '0 AS time_diff',
        'CASE WHEN v_speed = 0 THEN h_speed / 0.1 ELSE h_speed / ABS(v_speed) END AS glide_ratio',
        'vertical_accuracy',
        'speed_accuracy'
      ]
    )
  end

  it 'returns specified columns in only option' do
    query_builder = PointsQuery::QueryBuilder.new(
      track,
      only: [:altitude, :latitude, :longitude]
    )
    expect(query_builder.execute).to eq(
      [
        'abs_altitude - 0 AS altitude',
        'latitude',
        'longitude'
      ]
    )
  end

  it 'adds DISTINCT ON if freq_1hz option specified' do
    query_builder = PointsQuery::QueryBuilder.new(
      track,
      only: [:altitude],
      freq_1hz: true
    )
    expect(query_builder.execute).to eq(
      [
        'DISTINCT ON (floor(gps_time_in_seconds)) ' \
        'abs_altitude - 0 AS altitude'
      ]
    )
  end

  def track
    create :empty_track
  end
end

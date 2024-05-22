describe OnlineCompetitionsService do
  it 'Distance in time competition', :aggregate_failures do
    competition = virtual_competitions(:distance_in_time)

    track = create_track_from_file '06-38-21_SimonP.CSV', kind: :base

    described_class.score_track(track)

    results = competition.results.where(track: track)
    expect(results.count).to eq(1)

    record = results.first
    expect(record.result).to be_within(0.01).of(701.37)
    expect(record.highest_gr).to be_within(0.01).of(2.09)
    expect(record.highest_speed).to be_within(1).of(203)
  end

  it 'BASE Race', :aggregate_failures do
    competition = virtual_competitions(:base_race)

    track = create_track_from_file 'WBR/Yegor_16_Round3.CSV', kind: :base, place: places(:hellesylt)

    described_class.score_track(track)

    results = competition.results.where(track: track)
    expect(results.count).to eq(1)

    record = results.first
    expect(record.result).to be_within(1).of(29.0)
  end

  it 'Skydive distance prior to 2020', :aggregate_failures do
    place = create :place, name: 'Ravenna', msl: 0
    competition = virtual_competitions(:skydive_distance_wingsuit)

    track = create_track_from_file(
      '13-31-51_Ravenna.CSV',
      place_id: place.id,
      kind: :skydive
    )

    described_class.score_track(track)

    results = competition.results.where(track: track)
    expect(results.count).to eq(1)

    record = results.first
    expect(record.wind_cancelled).to be_falsey
    expect(record.result).to be_within(1).of(3410)
  end

  it 'Skydive distance with wind cancellation', :aggregate_failures do
    place = create :place, name: 'Ravenna', msl: 0
    competition = virtual_competitions(:skydive_distance_wingsuit)
    place.weather_data.create!(
      actual_on: '2017-06-03T11:00:00Z',
      altitude: 0,
      wind_speed: 10,
      wind_direction: 180
    )

    track = create_track_from_file(
      '13-31-51_Ravenna.CSV',
      place_id: place.id,
      kind: :skydive
    )

    described_class.score_track(track)

    results = competition.results.where(track: track)
    expect(results.count).to eq(2)

    record = results.find { |result| !result.wind_cancelled }
    expect(record.wind_cancelled).to be_falsey
    expect(record.result).to be_within(1).of(3410)

    wind_cancelled_record = results.find(&:wind_cancelled)
    expect(wind_cancelled_record.wind_cancelled).to be_truthy
    expect(wind_cancelled_record.result).to be_within(1).of(3324)
  end

  # For current track results are
  # 3500-2500 2847
  # 3000-2000 3410
  #
  # We set ground elevation to 500 meters to lower data by 500 meters
  # So 3000-2000 range should be chosen
  it 'Skydive distance starting 2020', :aggregate_failures do
    place = create :place, name: 'Ravenna', msl: 500
    competition = virtual_competitions(:skydive_distance_wingsuit)

    track = create_track_from_file(
      '13-31-51_Ravenna.CSV',
      place_id: place.id,
      kind: :skydive,
      recorded_at: Date.parse('2020-01-01')
    )

    described_class.score_track(track)

    results = competition.results.where(track: track)
    expect(results.count).to eq(1)

    record = results.first
    expect(record.wind_cancelled).to be_falsey
    expect(record.result).to be_within(1).of(3410)
  end

  it 'When one range out of data recorded' do
    place = create :place, name: 'Ravenna', msl: 1000
    competition = virtual_competitions(:skydive_distance_wingsuit)

    track = create_track_from_file(
      '13-31-51_Ravenna.CSV',
      place_id: place.id,
      kind: :skydive,
      recorded_at: Date.parse('2020-01-01')
    )

    described_class.score_track(track)

    results = competition.results.where(track: track)
    expect(results.count).to eq(1)

    record = results.first
    expect(record.result).to be_within(1).of(2847)
  end
end

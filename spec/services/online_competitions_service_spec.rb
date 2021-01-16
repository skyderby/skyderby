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
    competition = virtual_competitions(:skydive_distance)

    track = create_track_from_file(
      '13-31-51_Ravenna.CSV',
      place_id: place.id,
      kind: :skydive
    )

    described_class.score_track(track)

    results = competition.results.where(track: track)
    expect(results.count).to eq(1)

    record = results.first
    expect(record.result).to be_within(1).of(3410)
  end

  # For current track results are
  # 3500-2500 2847
  # 3000-2000 3410
  #
  # We set ground elevation to 500 meters to lower data by 500 meters
  # So 3000-2000 range should be chosen
  it 'Skydive distance starting 2020', :aggregate_failures do
    place = create :place, name: 'Ravenna', msl: 500
    competition = virtual_competitions(:skydive_distance)

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
    expect(record.result).to be_within(1).of(3410)
  end

  it 'When one range out of data recorded' do
    place = create :place, name: 'Ravenna', msl: 1000
    competition = virtual_competitions(:skydive_distance)

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

describe RangesToScoreFinder::BaseFinder do
  it 'returns range as given bounds, start altitude lower on 10 meters' do
    altitude_bounds = { max_altitude: 3000, min_altitude: -30 }
    ranges_finder = RangesToScoreFinder.for(:base).new(altitude_bounds)
    ranges_to_score = ranges_finder.calculate

    expect(ranges_to_score.size).to eq(1)
    expect(ranges_to_score.first).to eq(
      start_altitude: altitude_bounds[:max_altitude] - 10,
      end_altitude: altitude_bounds[:min_altitude]
    )
  end
end

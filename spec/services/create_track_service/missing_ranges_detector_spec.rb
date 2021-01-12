describe CreateTrackService::MissingRangesDetector do
  point_mock = Struct.new(:fl_time)

  it 'detect missing ranges in data' do
    points = [1, 1.2, 1.4, 1.6, 7, 9, 10, 11, 14, 14.2, 14.4, 14.6].map do |fl_time|
      point_mock.new(fl_time)
    end

    result = CreateTrackService::MissingRangesDetector.call(points, 5)
    expect(result).to eq([{ start: 1.6, end: 14 }])
  end

  it 'returns blank array unless points given' do
    result = CreateTrackService::MissingRangesDetector.call([], 5)
    expect(result).to eq([])
  end
end

describe Tracks::MissingRangesPresenter do
  it 'returns blank array if start time equals end time' do
    ranges = [{ start: 1, end: 2 }]
    result = Tracks::MissingRangesPresenter.call(ranges, 1, 1)
    expect(result).to eq([])
  end

  it 'returns blank array if ranges are not intersects with selected range' do
    ranges = [{ start: 1, end: 2 }]
    result = Tracks::MissingRangesPresenter.call(ranges, 3, 4)
    expect(result).to eq([])
  end

  it 'returns intersected ranges' do
    ranges = [{ 'start' => 10, 'end' => 20 }]
    result = Tracks::MissingRangesPresenter.call(ranges, 13, 21)
    expect(result).to eq([{ start: 0, end: 7 }])
  end

  it 'returns correct ranges if range fully inside' do
    ranges = [{ 'start' => 482.59, 'end' => 496.79 }]
    result = Tracks::MissingRangesPresenter.call(ranges, 479.0, 538.0)
    expect(result).to eq([{ start: 3.6, end: 17.8 }])
  end
end

describe TrackRange do
  it 'returns max altitude as from' do
    range = TrackRange.new(track)
    expect(range.from).to eq(3100)
  end

  it 'returns from argument' do
    range = TrackRange.new(track, from: 3000)
    expect(range.from).to eq(3000)
  end

  it 'returns max altitude if from argument higher than bounds' do
    range = TrackRange.new(track, from: 3200)
    expect(range.from).to eq(3100)
  end

  it 'returns to argument' do
    range = TrackRange.new(track, to: 2200)
    expect(range.to).to eq(2200)
  end

  it 'returns min altitude if to argument lower than bounds' do
    range = TrackRange.new(track, to: 1100)
    expect(range.to).to eq(1750)
  end

  it 'returns min altitude if to argument higher that from argument' do
    range = TrackRange.new(track, from: 2500, to: 2600)
    expect(range.to).to eq(1750)
  end

  it 'works with string arguments' do
    range = TrackRange.new(track, from: '2500', to: '2100')
    expect(range.from).to eq(2500)
    expect(range.to).to eq(2100)
  end

  it 'returns bounds if both arguments outside' do
    range = TrackRange.new(track, from: '3500', to: '3100')
    expect(range.from).to eq(3100)
    expect(range.to).to eq(1750)
  end

  def track
    create(:empty_track).tap do |track|
      allow(track).to receive(:altitude_bounds).and_return(
        max_altitude: 3100,
        min_altitude: 1750,
        elevation: 1350
      )
    end
  end
end

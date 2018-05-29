describe GfsGradsFetcher::Processor do
  it 'process hash input into weather data record params' do
    output = GfsGradsFetcher::Processor.new(input).execute
    expect(output.first[:altitude]).to be_within(0.1).of(100)
    expect(output.first[:wind_speed]).to be_within(0.1).of(7.8)
    expect(output.first[:wind_direction]).to be_within(0.5).of(230)
  end

  it 'raises ArgumentError if hgtsfc not a number' do
    invalid_input = input.tap do |input|
      input[:hgtsfc] = []
    end

    expect{ GfsGradsFetcher::Processor.new(invalid_input).execute }.to raise_exception(
      ArgumentError,
      'Surface height value not a number. Value: []'
    )
  end

  it 'raises ArgumentError if hgtsfc not a number' do
    invalid_input = input.tap do |input|
      input[:vgrdprs] = []
    end

    expect{ GfsGradsFetcher::Processor.new(invalid_input).execute }.to raise_exception(
      ArgumentError,
      "Heights and speeds count are different. Value counts: {:hgtprs=>1, :ugrdprs=>1, :vgrdprs=>0}"
    )
  end

  def input
    {
      hgtsfc: 10.5,
      hgtprs: [110.5],
      ugrdprs: [6.0],
      vgrdprs: [5.0]
    }
  end
end

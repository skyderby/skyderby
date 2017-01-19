describe GfsGradsFetcher::Processor do
  it 'process hash input into weather data record params' do
    output = GfsGradsFetcher::Processor.new(input).execute
    expect(output.first[:altitude]).to be_within(0.1).of(100)
    expect(output.first[:wind_speed]).to be_within(0.1).of(7.8)
    expect(output.first[:wind_direction]).to be_within(0.5).of(230)
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

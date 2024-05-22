describe ChartsPreferences do
  it '#metric?' do
    preferences = ChartsPreferences.new(preferred_charts_units: 'metric')
    expect(preferences.metric?).to be_truthy
  end

  it 'returns metric unit system' do
    preferences = ChartsPreferences.new(preferred_charts_units: 'metric')
    expect(preferences.unit_system).to eq(UnitSystem::Metric)
  end

  it '#imperial?' do
    preferences = ChartsPreferences.new(preferred_charts_units: 'imperial')
    expect(preferences.imperial?).to be_truthy
  end

  it 'returns imperial unit system' do
    preferences = ChartsPreferences.new(preferred_charts_units: 'imperial')
    expect(preferences.unit_system).to eq(UnitSystem::Imperial)
  end

  it 'metric if unknown unit system' do
    preferences = ChartsPreferences.new(preferred_charts_units: 'pirates')
    expect(preferences.metric?).to be_truthy
  end

  it 'returns metric if unit system unknown' do
    preferences = ChartsPreferences.new(preferred_charts_units: 'imperial')
    expect(preferences.unit_system).to eq(UnitSystem::Imperial)
  end

  it '#separate?' do
    preferences = ChartsPreferences.new(preferred_charts_mode: 'separate')
    expect(preferences.separate?).to be_truthy
  end
end

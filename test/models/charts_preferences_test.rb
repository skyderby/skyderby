require 'test_helper'

class ChartsPreferencesTest < ActiveSupport::TestCase
  test '#metric?' do
    preferences = ChartsPreferences.new(preferred_charts_units: 'metric')
    assert_predicate preferences, :metric?
  end

  test 'returns metric unit system' do
    preferences = ChartsPreferences.new(preferred_charts_units: 'metric')
    assert_equal UnitSystem::Metric, preferences.unit_system
  end

  test '#imperial?' do
    preferences = ChartsPreferences.new(preferred_charts_units: 'imperial')
    assert_predicate preferences, :imperial?
  end

  test 'returns imperial unit system' do
    preferences = ChartsPreferences.new(preferred_charts_units: 'imperial')
    assert_equal UnitSystem::Imperial, preferences.unit_system
  end

  test 'metric if unknown unit system' do
    preferences = ChartsPreferences.new(preferred_charts_units: 'pirates')
    assert_predicate preferences, :metric?
  end

  test 'returns metric if unit system unknown' do
    preferences = ChartsPreferences.new(preferred_charts_units: 'imperial')
    assert_equal UnitSystem::Imperial, preferences.unit_system
  end

  test '#separate?' do
    preferences = ChartsPreferences.new(preferred_charts_mode: 'separate')
    assert_predicate preferences, :separate?
  end
end

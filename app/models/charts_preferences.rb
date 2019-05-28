class ChartsPreferences
  DEFAULT_UNITS = 'metric'.freeze
  AVAILABLE_UNITS = %w[metric imperial].freeze

  DEFAULT_MODE = 'separate'.freeze
  AVAILABLE_MODES = %w[separate single].freeze

  def initialize(value_store)
    @value_store = value_store
  end

  def unit_system
    UnitSystem.const_get(preferred_units.classify)
  end

  def metric?
    preferred_units == 'metric'
  end

  def imperial?
    preferred_units == 'imperial'
  end

  def separate?
    preferred_mode == 'separate'
  end

  def single?
    preferred_mode == 'single'
  end

  def preferred_units
    preferences_value = value_store[:preferred_charts_units]

    return DEFAULT_UNITS unless AVAILABLE_UNITS.include? preferences_value

    preferences_value
  end

  private

  attr_reader :value_store

  def preferred_mode
    preferences_value = value_store[:preferred_charts_mode]

    return DEFAULT_MODE unless AVAILABLE_MODES.include? preferences_value

    preferences_value
  end
end

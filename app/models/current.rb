class Current < ActiveSupport::CurrentAttributes
  attribute :user, :profile, :charts_mode, :charts_units, :speed_skydiving_units

  def user=(user)
    super
    self.profile = user.profile
  end

  def charts_mode=(mode)
    default_mode = 'separate'
    super(%w[separate single].include?(mode) ? mode : default_mode)
  end

  def charts_mode = super.inquiry

  def charts_units=(units)
    default_units = 'metric'
    super(%w[metric imperial].include?(units) ? units : default_units)
  end

  def charts_units = super.inquiry

  def speed_skydiving_units=(units)
    default_units = 'metric'
    super(%w[metric imperial].include?(units) ? units : default_units)
  end

  def speed_skydiving_units = super.inquiry

  def default_units
    user&.registered? ? user.setting.default_units : nil
  end

  def default_speed_skydiving_units
    user&.registered? ? user.setting.speed_skydiving_units : nil
  end

  def subscription_active? = user&.subscription_active? || false
end

class Current < ActiveSupport::CurrentAttributes
  attribute :user, :profile, :charts_mode, :charts_units

  def user=(user)
    super
    self.profile = user.profile
  end

  def charts_mode=(mode)
    default_mode = 'separate'
    super(%w[separate single].include?(mode) ? mode : default_mode)
  end

  def charts_mode
    super.inquiry
  end

  def charts_units=(units)
    default_units = 'metric'
    super(%w[metric imperial].include?(units) ? units : default_units)
  end

  def charts_units
    super.inquiry
  end

  def subscription_active? = false
end

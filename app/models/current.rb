class Current < ActiveSupport::CurrentAttributes
  attribute :user, :profile, :charts_mode

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
end

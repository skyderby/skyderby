class Current < ActiveSupport::CurrentAttributes
  attribute :user, :profile

  def user=(user)
    super
    self.profile = user.profile
  end
end

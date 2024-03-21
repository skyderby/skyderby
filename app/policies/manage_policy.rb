class ManagePolicy
  attr_reader :user

  def initialize(user)
    @user = user
  end

  def manage?
    user&.admin?
  end
end

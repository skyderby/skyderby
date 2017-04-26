class ManagePolicy
  attr_reader :user

  def initialize(user)
    @user = user
  end

  def manage?
    user&.has_role? :admin
  end
end

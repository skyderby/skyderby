class ProfilePolicy < ApplicationPolicy
  def update?
    admin? || owner?
  end

  def owner?
    user && profile.user == user
  end
end

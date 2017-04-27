class ProfilePolicy < ApplicationPolicy
  def update?
    admin? || owner?
  end

  def masquerade?
    admin?
  end

  def owner?
    user && record.user == user
  end
end

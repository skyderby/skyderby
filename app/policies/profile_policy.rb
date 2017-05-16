class ProfilePolicy < ApplicationPolicy
  def index?
    admin?
  end

  def update?
    admin? || owner?
  end

  def masquerade?
    admin?
  end

  def merge?
    admin?
  end

  def owner?
    user && record.user == user
  end
end

class Track::OwnershipPolicy < ApplicationPolicy
  def show?
    admin?
  end

  def update?
    admin?
  end
end

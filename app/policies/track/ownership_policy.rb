class Track::OwnershipPolicy < ApplicationPolicy
  def show? = admin?

  def update? = admin?
end

class PlacePolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
  end

  def create?
    can_edit? || admin?
  end

  def update?
    can_edit? || admin?
  end

  def destroy?
    can_edit? || admin?
  end

  private

  def can_edit?
    user&.role? :edit_places
  end
end

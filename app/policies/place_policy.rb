class PlacePolicy < ApplicationPolicy
  def index? = true

  def show? = true

  def create? = can_edit? || admin?

  def update? = can_edit? || admin?

  def destroy? = can_edit? || admin?

  private

  def can_edit? = user&.role? :edit_places
end

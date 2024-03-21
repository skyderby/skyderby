class UserPolicy < ApplicationPolicy
  def index? = admin?

  def show? = admin?
end

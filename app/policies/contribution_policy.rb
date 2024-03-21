class ContributionPolicy < ApplicationPolicy
  def index? = admin?

  def show? = admin?
end

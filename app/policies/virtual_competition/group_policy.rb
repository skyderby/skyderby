class VirtualCompetition::GroupPolicy < ApplicationPolicy
  def index? = admin?

  def show? = admin?
end

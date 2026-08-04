class VirtualCompetition::GroupPolicy < ApplicationPolicy
  def index?
    admin?
  end

  def show?
    true
  end
end

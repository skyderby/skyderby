class VirtualCompetitionPolicy < ApplicationPolicy
  def index?
    true
  end

  def create?
    admin?
  end

  def show?
    true
  end

  def update?
    admin?
  end

  def destroy?
    admin?
  end
end

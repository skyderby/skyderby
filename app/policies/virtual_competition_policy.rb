class VirtualCompetitionPolicy < ApplicationPolicy
  def index?
    true
  end

  def create?
    admin?
  end

  def show?
    record.viewable?(user)
  end

  def update?
    admin?
  end

  def manage_participants?
    record.manageable_by?(user)
  end

  def destroy?
    admin?
  end
end

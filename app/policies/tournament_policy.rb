class TournamentPolicy < ApplicationPolicy
  def index?
    true
  end

  def show?
    true
  end

  def update?
    organizer? || admin?
  end

  def organizer?
    return false unless user&.profile
    record.responsible == user.profile
  end
end

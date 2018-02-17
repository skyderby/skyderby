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
    return false unless user.registered?

    record.responsible == user
  end
end

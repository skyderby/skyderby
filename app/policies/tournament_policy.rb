class TournamentPolicy < ApplicationPolicy
  def index? = true

  def show? = true

  def update? = organizer? || admin?

  def organizer?
    return false unless user.registered?

    responsible? || user.organizer_of_event?(record)
  end

  def responsible?
    return false unless user.registered?

    record.responsible == user
  end

  class Scope < Scope
    def resolve = scope.all
  end
end

class EventPolicy < ApplicationPolicy
  def index? = true

  def create? = user.registered?

  def show?
    return true if admin?
    return organizer? if record.draft?
    return true if record.public_event? || record.unlisted_event?

    participant?
  end

  def update? = organizer? || admin?

  def destroy? = responsible? || admin?

  def download? = organizer? || admin?

  private

  def participant?
    return false unless user.registered?

    record.responsible == user || user.participant_of_events.include?(record)
  end

  def organizer?
    return false unless user.registered?

    responsible? || user.organizer_of_event?(record)
  end

  def responsible?
    return false unless user.registered?

    record.responsible == user
  end

  class Scope < Scope
    def resolve
      scope.where('status IN (1, 2) AND visibility = 0')
           .or(scope.where(responsible: user))
           .or(scope.where(id: user.participant_of_events))
    end
  end
end

class SpeedSkydivingCompetitionPolicy < ApplicationPolicy
  def create? = user.registered?

  def show?
    return true if admin?
    return organizer? if record.draft?
    return true if record.public_event? || record.unlisted_event?

    participant?
  end

  def update? = organizer? || admin?

  def destroy? = responsible? || admin?

  def organizer?
    return false unless user.registered?

    responsible? || user.organizer_of_event?(record)
  end

  def responsible?
    return false unless user.registered?

    record.responsible == user
  end

  def participant?
    return false unless user.registered?

    user.participant_of_events.include?(record)
  end
end

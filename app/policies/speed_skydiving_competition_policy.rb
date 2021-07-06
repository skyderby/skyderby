class SpeedSkydivingCompetitionPolicy < ApplicationPolicy
  def create? = user.registered?

  def show? = true

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
end

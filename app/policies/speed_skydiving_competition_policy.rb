class SpeedSkydivingCompetitionPolicy < ApplicationPolicy
  def create? = user.registered?

  def show? # rubocop:disable Metrics/CyclomaticComplexity
    return true if admin? || organizer? || responsible?
    return organizer? || responsible? if record.draft?
    return true if record.public_event? || record.unlisted_event?

    participant?
  end

  def update? = organizer? || responsible? || admin?

  def destroy? = responsible? || admin?

  def download? = organizer? || responsible? || admin?

  private

  def organizer?
    return false unless user.registered?

    record.organizers.any? { |organizer| organizer.user == user }
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

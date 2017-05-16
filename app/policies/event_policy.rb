class EventPolicy < ApplicationPolicy
  def index?
    true
  end

  def create?
    user
  end

  def show?
    return true if admin?
    return organizer? if record.draft?
    return true if record.public_event? || record.unlisted_event?

    participant?
  end

  def update?
    organizer? || admin?
  end

  def destroy?
    responsible? || admin?
  end

  private

  def participant?
    return false unless user&.profile

    record.responsible == user.profile ||
      user.profile.participant_of_events.include?(record.id)
  end

  def organizer?
    return false unless user&.profile

    responsible? || user.profile.organizer_of_events.include?(record.id)
  end

  def responsible?
    return false unless user&.profile

    record.responsible == user.profile
  end

  class Scope < Scope
    def resolve
      scope.where('status IN (1, 2) AND visibility = 0')
           .or(scope.where(responsible: profile))
           .or(scope.where(id: profile.participant_of_events))
    end

    def profile
      user&.profile || NullProfile.new
    end

    class NullProfile
      def participant_of_events
        []
      end
    end
  end
end

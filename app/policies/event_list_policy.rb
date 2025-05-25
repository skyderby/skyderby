class EventListPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      return scope.all if admin?

      scope.not_draft.public_event
           .or(scope.where(responsible: user))
           .or(scope.where(event: user.participant_of_events))
    end
  end
end

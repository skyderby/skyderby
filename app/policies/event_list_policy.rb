class EventListPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      return scope.all if admin?

      scope.where('status IN (1, 2) AND visibility = 0')
           .or(scope.where(responsible: user))
           .or(scope.where(event: user.participant_of_events))
    end
  end
end

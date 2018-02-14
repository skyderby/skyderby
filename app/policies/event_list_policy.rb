class EventListPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      return scope.all if admin?

      scope.where('status IN (1, 2) AND visibility = 0')
           .or(scope.where(responsible: profile))
           .or(scope.where(event_type: 'Event', event_id: profile.participant_of_events))
    end
  end
end

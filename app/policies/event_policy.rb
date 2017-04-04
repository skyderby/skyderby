class EventPolicy < ApplicationPolicy
  class Scope < Scope
    def resolve
      scope.where('status IN (1, 2) AND visibility = 0')
           .or(scope.where(responsible: profile))
           .or(scope.where(id: profile.participant_of_events))
    end

    def profile
      user&.profile || NullProfile
    end

    class NullProfile
      def participant_of_events
        []
      end
    end
  end
end

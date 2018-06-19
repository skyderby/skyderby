class TrackPolicy < ApplicationPolicy
  def index?
    true
  end

  def create?
    true
  end

  def show?
    public_track? || unlisted_track? || can_change?
  end

  def update?
    can_change?
  end

  def destroy?
    can_change?
  end

  def download?
    return true if admin?
    return false unless user.registered?
    return false unless record.pilot

    record.pilot == user.profile
  end

  private

  delegate :public_track?, :unlisted_track?, to: :record

  def can_change?
    admin? || owner? || organizer_of_event_track_belongs_to?
  end

  def owner?
    if user.registered?
      record.owner == user
    else
      user.tracks.include? record.id
    end
  end

  def organizer_of_event_track_belongs_to?
    return false if record.belongs_to_user?
    return false unless user.registered?

    user.organizer_of_event? record.owner
  end

  class Scope < Scope
    def resolve
      return scope.public_track unless user&.profile
      return scope.all if admin?

      scope.where(pilot: user.profile).or(scope.public_track)
    end
  end
end

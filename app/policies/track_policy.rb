class TrackPolicy < ApplicationPolicy
  def index?
    true
  end

  def create?
    true
  end

  def show?
    admin? || owner? || public_track? || unlisted_track?
  end

  def update?
    admin? || owner?
  end

  def destroy?
    admin? || owner?
  end

  private

  delegate :public_track?, :unlisted_track?, to: :record

  def owner?
    if user.registered?
      return false unless user&.profile
      record.pilot == user.profile
    else
      user.tracks.include? record.id
    end
  end

  class Scope < Scope
    def resolve
      return scope.public_track unless user&.profile
      return scope.all if admin?

      scope.where(pilot: user.profile).or(scope.public_track)
    end
  end
end

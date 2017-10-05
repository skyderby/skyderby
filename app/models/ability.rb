class Ability
  include CanCan::Ability

  def initialize(user)
    define_tracks_abilities(user)

    can :read, Place

    can :read, Tournament

    return unless user

    can [:create, :update, :destroy], Place if user.has_role? :places_edit

    can :create, Tournament
    can :edit, Tournament do |tournament|
      tournament.responsible == user.profile
    end
    cannot :edit, Tournament, responsible: nil

    # allow admins to do anything
    can :manage, :all if user.has_role? :admin
  end

  def define_tracks_abilities(user)
    # guest user (not logged in)
    can :read, Track do |track|
      track.public_track? || track.unlisted_track?
    end

    can :create, Track
    can [:update, :destroy], Track, pilot: nil, lastviewed_at: nil

    return unless user

    can [:read, :update, :destroy], Track do |track|
      track.pilot && track.pilot == user.profile
    end

    cannot :destroy, Track do |track|
      track.competitive?
    end
  end
end

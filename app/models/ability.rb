class Ability
  include CanCan::Ability

  def initialize(user)
    # guest user (not logged in)
    user ||= User.new

    can :read, Track, visibility: %w(public_track unlisted_track)
    can :create, Track
    can :update, Track, user: nil, lastviewed_at: nil

    can :read, Event, status: %w(published finished)
    can :read, Section
    can :read, Competitor
    can :read, Round
    can :read, EventTrack

    can :read, Wingsuit
    can :read, Place

    can :read, UserProfile
    can :read, Badge

    can :destroy, Track do |track|
      if track.event_track
        false
      elsif track.user
        true
      elsif !track.user && !track.lastviewed_at
        true
      else
        false
      end
    end

    if user
      can [:read, :update], Track, user: user  # Редактирование собственных треков

      can :update, UserProfile, user: user

      can :create, Event
      can :destroy, Event, responsible: user, status: :draft

      can [:read, :update], Event do |event|
        if event.responsible == user.user_profile ||
           event.event_organizers.any? { |x| x.user_profile == user.user_profile }
          can :manage, Section
          can :manage, Competitor
          can :manage, Round
          can :manage, EventTrack
          can :manage, EventOrganizer

          true
        end
      end

      # allow admins to do anything
      if user.has_role? :admin
        can :manage, :all
      end
    end
  end
end

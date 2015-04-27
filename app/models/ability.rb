class Ability
  include CanCan::Ability

  def initialize(user)
    user ||= User.new # guest user (not logged in)

    can :read, Track, visibility: %w(public_track unlisted_track)
    can :read, Event, status: %w(published finished)
    can :read, UserProfile
    can :create, Track
    can :update, Track, user: nil, lastviewed_at: nil

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

      can :destroy, Event, responsible: user, status: :draft

      can [:read, :update], Event do |event|
        event.responsible == user.user_profile ||
          event.event_organizers.any? { |x| x.user_profile == user.user_profile }
      end

      if user.has_role? :admin
        can :manage, :all               # allow admins to do anything
      end

      if user.has_role? :create_events
        can [:create, :edit], Event
      end
    end
  end
end

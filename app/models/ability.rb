class Ability
  include CanCan::Ability

  def initialize(user)
    user ||= User.new # guest user (not logged in)

    can :read, Track, visibility: %w(public_track unlisted_track)
    can :read, Event, status: %w(published finished)
    can :create, Track
    can :update, Track, user: nil, lastviewed_at: nil

    can [:destroy], Track do |track|
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

      can [:read, :update], Track, :user => user  # Редактирование собственных треков

      can :destroy, Event, :responsible => user, :status => :draft
      can [:read, :update], Event, :responsible => user.user_profile

      if user.has_role? :admin

        can :access, :rails_admin       # only allow admin users to access Rails Admin
        can :dashboard                  # allow access to dashboard
        can :manage, :all               # allow admins to do anything

      end

      if user.has_role? :create_events
        can [:create, :edit], Event
      end

    end
  end
end

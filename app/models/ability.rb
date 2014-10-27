class Ability
  include CanCan::Ability

  def initialize(user)

    user ||= User.new # guest user (not logged in)

    can :read, Track, :visibility => ['public_track', 'unlisted_track']
    can :create, Track
    can [:update, :destroy], Track, :user => nil, :lastviewed_at => nil

    if user

      can [:read, :update], Track, :user => user  # Редактирование собственных треков
      can :destroy, Track, :user => user, :event_track => nil # Удаление собственных треков

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

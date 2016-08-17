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
    can :read, WeatherDatum

    can :read, Wingsuit
    can :read, Place
    can :read, Country

    can :show, Profile

    can :read,  Tournament

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

    return unless user

    # Edit own tracks
    can [:read, :update], Track do |track|
      if track.user == user
        can :manage, WeatherDatum

        true
      end
    end

    can :update, Profile, user: user

    can :create, Event
    can :destroy, Event, responsible: user, status: :draft

    can [:read, :update], Event do |event|
      if event.responsible == user.profile ||
         event.event_organizers.any? { |x| x.profile == user.profile }
        can :manage, Section
        can :manage, Competitor
        can :manage, Round
        can :manage, EventTrack
        can :manage, EventOrganizer
        can :manage, WeatherDatum
        can :manage, Sponsor, sponsorable_type: 'Event', sponsorable_id: event.id

        true
      end
    end

    can [:create, :update, :destroy], Place if user.has_role? :places_edit

    # allow admins to do anything
    can :manage, :all if user.has_role? :admin
  end
end

class Ability
  include CanCan::Ability

  def initialize(user)
    define_tracks_abilities(user)
    # guest user (not logged in)
    user ||= User.new

    can :read, Event, status: [
      Event.statuses[:published], 
      Event.statuses[:finished]
    ]

    can :read, [Section, Competitor, Round, EventTrack, Sponsor, WeatherDatum]

    can :read, Wingsuit
    can :read, Place

    can :show, Profile

    can :read,  Tournament

    return unless user

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

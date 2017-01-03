class Ability
  include CanCan::Ability

  def initialize(user)
    define_tracks_abilities(user)
    define_events_abilities(user)
    # guest user (not logged in)
    user ||= User.new

    can :read, Wingsuit
    can :read, Place

    can :show, Profile

    can :read, Tournament

    return unless user

    can :update, Profile, user: user

    can [:create, :update, :destroy], Place if user.has_role? :places_edit

    # allow admins to do anything
    can :manage, :all if user.has_role? :admin
  end

  def define_events_abilities(user)
    can :read, Event do |event|
      if (event.public_event? || event.unlisted_event?) && !event.draft?
        can :read, [Section, Competitor, Round, EventTrack, Sponsor, WeatherDatum]
        true
      end
    end

    return unless user

    can :create, Event
    can :destroy, Event, responsible: user, status: :draft

    can :read, Event do |event|
      event.responsible == user.profile ||
        event.event_organizers.any? { |x| x.profile == user.profile } ||
        event.competitors.any? { |x| x.proflie == user.profile }
    end

    can :update, Event do |event|
      if event.responsible == user.profile ||
         event.event_organizers.any? { |x| x.profile == user.profile }
        can :manage, [Section, Competitor, Round, EventTrack, EventOrganizer, WeatherDatum]
        can :manage, Sponsor, sponsorable_type: 'Event', sponsorable_id: event.id
        true
      end
    end
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

module Profiles
  class Feed
    PERIOD = 30.days
    TRACKS_LIMIT = 500
    PILOT_PRELOADS = [:country, { userpic_attachment: :blob }].freeze

    attr_reader :user, :until_date

    def initialize(user, until_date: nil)
      @user = user
      @until_date = until_date || Time.zone.today
    end

    def items
      @items ||= (track_groups + competitions + rankings).sort_by { |item| [item.date, item.sort_time] }.reverse
    end

    delegate :empty?, to: :items

    def following? = followed_profile_ids.any? || favorite_competition_ids.any?

    def from_date = until_date - PERIOD

    def older_until_date
      @older_until_date ||= [
        latest_track_date_before(from_date),
        latest_event_date_before(from_date),
        latest_top_entry_date_before(from_date)
      ].compact.max
    end

    def older? = older_until_date.present?

    private

    def followed_profile_ids
      @followed_profile_ids ||= user.profile_follows.pluck(:profile_id)
    end

    def own_profile_id = user.profile&.id

    def profile_ids = [*followed_profile_ids, own_profile_id].compact.uniq

    def track_groups
      tracks
        .group_by { |track| [track.profile_id, track.created_at.to_date] }
        .map { |(_profile_id, date), group| TrackGroup.new(profile: group.first.pilot, date:, tracks: group) }
    end

    def tracks
      visible_tracks
        .where(created_at: period_range)
        .includes(:time, :distance, :speed, :vertical_speed_result, :video, place: :country, suit: :manufacturer,
                                                                            pilot: PILOT_PRELOADS)
        .order(created_at: :desc)
        .limit(TRACKS_LIMIT)
    end

    def visible_tracks
      Track.where(profile_id: followed_profile_ids, visibility: :public_track)
           .or(Track.where(profile_id: own_profile_id))
    end

    def competitions
      events_in(period_range.begin.to_date..until_date)
        .map { |event| CompetitionCard.new(event:, profile_ids:, user:) }
    end

    def events_in(dates)
      event_models.flat_map do |model|
        visible_events(model).where(starts_at: dates).includes(:place).to_a
      end
    end

    def rankings
      top_entries.where(entered_at: period_range)
                 .includes(:virtual_competition, :track, profile: { userpic_attachment: :blob })
                 .group_by { |entry| [entry.virtual_competition, entry.entered_at.to_date, entry.year] }
                 .map { |(competition, date, year), entries| RankingCard.new(competition:, date:, year:, entries:) }
                 .reject(&:empty?)
    end

    def top_entries
      entries = VirtualCompetition::TopEntry
      entries.where(profile_id: profile_ids).or(entries.where(virtual_competition_id: favorite_competition_ids))
    end

    def favorite_competition_ids
      @favorite_competition_ids ||= user.virtual_competition_favorites.pluck(:virtual_competition_id)
    end

    def latest_top_entry_date_before(date)
      top_entries.where(entered_at: ...date.beginning_of_day).maximum(:entered_at)&.to_date
    end

    def event_models = [PerformanceCompetition, SpeedSkydivingCompetition, Boogie, Tournament]

    def visible_events(model) = model.public_event.where.not(status: :draft)

    def latest_track_date_before(date)
      visible_tracks.where(created_at: ...date.beginning_of_day).maximum(:created_at)&.to_date
    end

    def latest_event_date_before(date)
      event_models.filter_map { |model| visible_events(model).where(starts_at: ...date).maximum(:starts_at) }.max
    end

    def period_range = from_date.beginning_of_day..until_date.end_of_day
  end
end

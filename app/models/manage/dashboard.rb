module Manage
  class Dashboard
    def tracks_count
      Track.count
    end

    def users_count
      User.count
    end

    def profiles_count
      Profile.count
    end

    def events_count
      EventList.count
    end

    def uploads_by_month
      Track.where('created_at > ?', 1.year.ago.beginning_of_month)
           .group("date_trunc('month', created_at)")
           .count
           .sort
           .to_h
    end

    def registrations_by_month
      User.where('created_at > ?', 1.year.ago.beginning_of_month)
          .group("date_trunc('month', created_at)")
          .count
          .sort
          .to_h
    end

    def top_active_users
      Track.where('tracks.created_at > ?', 1.year.ago.beginning_of_month)
           .joins(:pilot)
           .where.not(profiles: { user_id: nil })
           .group('profile_id')
           .order('count_all desc')
           .limit(12)
           .count
           .map { |profile_id, count| [Profile.find(profile_id), count] }.to_h
    end
  end
end

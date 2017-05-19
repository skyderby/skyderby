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

  end
end

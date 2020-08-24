module CurrentAnnouncements
  extend ActiveSupport::Concern

  included do
    before_action :set_current_announcement
  end

  def set_current_announcement
    active_announcements = Announcement.active.to_a

    return if active_announcements.empty?

    hourly_schedule = active_announcements.cycle((24.0 / active_announcements.size).ceil).to_a
    @announcement = hourly_schedule[Time.current.hour]
  end
end

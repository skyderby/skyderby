class FreeProView < ApplicationRecord
  belongs_to :user
  belongs_to :track

  validates :user_id, uniqueness: { scope: :track_id }

  scope :current_month, -> { where(created_at: Time.current.beginning_of_month..) }

  after_create_commit :schedule_tracking_job

  def self.monthly_usage_for(user)
    where(user: user).current_month.count
  end

  def self.monthly_limit
    5
  end

  def self.remaining_for(user)
    monthly_limit - monthly_usage_for(user)
  end

  def self.grant(user:, track:)
    return :subscriber if user.subscription_active?
    return :already if exists?(user: user, track: track)
    return :limit_reached if remaining_for(user) <= 0

    create!(user: user, track: track)
    :granted
  end

  def track_amplitude_events
    summary = FreeProViewsSummary.new(user)

    Amplitude.track_later(
      user_id: user_id,
      event: "#{track.kind}_pro_view_activated",
      properties: {
        track_id: track_id,
        views_remaining: summary.views_remaining,
        is_own_track: track.recorded_by?(user),
        unique_months: summary.unique_months
      }
    )

    return unless summary.views_remaining.zero?

    Amplitude.track_later(
      user_id: user_id,
      event: "#{track.kind}_pro_view_limit_reached",
      properties: {
        days_to_reset: summary.days_to_reset,
        track_ids: summary.track_ids,
        own_tracks_ratio: summary.own_tracks_ratio,
        unique_months: summary.unique_months
      }
    )
  end

  private

  def schedule_tracking_job
    FreeProViewTrackingJob.perform_later(id)
  end
end

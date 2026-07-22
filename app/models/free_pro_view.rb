class FreeProView < ApplicationRecord
  belongs_to :user
  belongs_to :track, optional: true

  validates :user_id, uniqueness: { scope: :track_id }

  scope :current_month, -> { where(created_at: Time.current.beginning_of_month..) }
  scope :counted, -> { where(first_look: false) }

  after_create_commit :schedule_tracking_job

  def self.monthly_usage_for(user)
    where(user: user).counted.current_month.count
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

  def self.grant_first_look(user:, track:)
    return unless first_look_eligible?(user:, track:)

    create!(user: user, track: track, first_look: true)
  end

  def self.first_look_eligible?(user:, track:)
    return false unless user.registered?
    return false if user.subscription_active?
    return false unless pro_eligible_kind?(track)
    return false if exists?(user: user)
    return false if uploaded_earlier_today?(user, track)

    prior_uploads_count(user, track) >= 2
  end

  def self.pro_eligible_kind?(track)
    track.base? || track.skydive? || track.speed_skydiving?
  end
  private_class_method :pro_eligible_kind?

  def self.prior_uploads_count(user, track)
    Track.where(owner_type: 'User', owner_id: user.id).where.not(id: track.id).count
  end
  private_class_method :prior_uploads_count

  def self.uploaded_earlier_today?(user, track)
    Track
      .where(owner_type: 'User', owner_id: user.id)
      .where(created_at: Time.current.beginning_of_day..)
      .where.not(id: track.id)
      .exists?
  end
  private_class_method :uploaded_earlier_today?

  def track_amplitude_events
    return track_first_look_event if first_look?

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

  def track_first_look_event
    Amplitude.track_later(
      user_id: user_id,
      event: 'pro_view_first_look_granted',
      properties: {
        track_id: track_id,
        kind: track.kind,
        is_own_track: track.recorded_by?(user)
      }
    )
  end

  def schedule_tracking_job
    FreeProViewTrackingJob.perform_later(id)
  end
end

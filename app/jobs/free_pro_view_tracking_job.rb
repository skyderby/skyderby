class FreeProViewTrackingJob < ApplicationJob
  def perform(free_pro_view_id)
    free_pro_view = FreeProView.find(free_pro_view_id)
    user = free_pro_view.user
    track = free_pro_view.track
    summary = FreeProViewsSummary.new(user)

    Amplitude.track(
      user_id: user.id,
      event: 'base_pro_view_activated',
      properties: {
        track_id: track.id,
        views_remaining: summary.views_remaining,
        is_own_track: track.pilot == user.profile,
        unique_months: summary.unique_months
      }
    )

    return unless summary.views_remaining.zero?

    Amplitude.track(
      user_id: user.id,
      event: 'base_pro_view_limit_reached',
      properties: {
        days_to_reset: summary.days_to_reset,
        track_ids: summary.track_ids,
        own_tracks_ratio: summary.own_tracks_ratio,
        unique_months: summary.unique_months
      }
    )
  end
end

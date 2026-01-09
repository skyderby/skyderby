class FreeProViewsSummary
  attr_reader :user

  def initialize(user)
    @user = user
  end

  def days_to_reset = (Date.current.next_month.beginning_of_month - Date.current).to_i

  def track_ids = current_month_views.pluck(:track_id)

  def own_tracks_ratio
    return 0.0 if current_month_views.empty?

    (own_tracks_count.to_f / current_month_views.count).round(2)
  end

  def unique_months
    FreeProView
      .where(user:)
      .distinct
      .pluck(Arel.sql("to_char(created_at, 'YYYY-MM')"))
      .count
  end

  def views_remaining = FreeProView.remaining_for(user)

  private

  def current_month_views
    @current_month_views ||= FreeProView.where(user:).current_month
  end

  def own_tracks_count = Track.where(id: track_ids, profile_id: user.profile&.id).count
end

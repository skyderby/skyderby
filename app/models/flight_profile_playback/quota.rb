class FlightProfilePlayback::Quota
  attr_reader :user

  def initialize(user)
    @user = user
  end

  def limit = FlightProfilePlayback::MONTHLY_LIMIT

  def unlimited? = user.subscription_active?

  def available? = user.registered?

  def counted_track_ids
    @counted_track_ids ||= available? ? FlightProfilePlayback.current_month.where(user:).pluck(:track_id) : []
  end

  def used = counted_track_ids.size

  def remaining = [limit - used, 0].max

  def resets_at = Time.current.next_month.beginning_of_month

  def allows?(track_ids)
    return false unless available?
    return true if unlimited?

    (normalize(track_ids) - counted_track_ids).size <= remaining
  end

  def grant(track_ids)
    return :sign_in_required unless available?
    return :subscriber if unlimited?

    new_ids = Track.where(id: normalize(track_ids)).pluck(:id) - counted_track_ids
    return :already if new_ids.empty?
    return :limit_reached if new_ids.size > remaining

    record(new_ids)
    :granted
  end

  private

  def normalize(track_ids) = Array(track_ids).map(&:to_i).uniq

  def record(track_ids)
    month = Date.current.beginning_of_month
    FlightProfilePlayback.transaction do
      track_ids.each { |track_id| FlightProfilePlayback.find_or_create_by!(user:, track_id:, month:) }
    end
    @counted_track_ids = nil
  end
end

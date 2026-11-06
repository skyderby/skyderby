class FlightProfilePlayback::Quota
  attr_reader :user

  def initialize(user)
    @user = user
  end

  def limit = FlightProfilePlayback::MONTHLY_LIMIT

  def unlimited? = user.subscription_active?

  def available? = user.registered?

  def counted_track_ids
    @counted_track_ids ||=
      available? && !unlimited? ? FlightProfilePlayback.current_month.where(user:).pluck(:track_id) : []
  end

  def remaining = [limit - counted_track_ids.size, 0].max

  def resets_at = Time.current.next_month.beginning_of_month

  def grant(track_ids)
    return :sign_in_required unless available?
    return :subscriber if unlimited?

    FlightProfilePlayback.transaction do
      user.lock!
      @counted_track_ids = nil
      new_ids = Track.viewable(user:).where(id: normalize(track_ids)).pluck(:id) - counted_track_ids
      next :already if new_ids.empty?
      next :limit_reached if new_ids.size > remaining

      record(new_ids)
      :granted
    end
  end

  private

  def normalize(track_ids)
    Array(track_ids).flatten.filter_map { |id| Integer(id.to_s, exception: false) }.uniq
  end

  def record(track_ids)
    month = Date.current.beginning_of_month
    track_ids.each { |track_id| FlightProfilePlayback.create_or_find_by!(user:, track_id:, month:) }
    @counted_track_ids = nil
  end
end

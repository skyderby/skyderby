class LandingPage
  STATS_TTL = 1.hour

  def users_count
    fetch(:users_count) { "#{User.count.floor(-2)}+" }
  end

  def tracks_count
    fetch(:tracks_count) { "#{Track.last.id.floor(-3)}+" }
  end

  private

  def fetch(key, &)
    Rails.cache.fetch("landing_page/#{key}/v1", expires_in: STATS_TTL, &)
  end
end

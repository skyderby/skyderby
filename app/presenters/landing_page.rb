class LandingPage
  def users_count
    "#{User.last.id.ceil(-2)}+"
  end

  def tracks_count
    "#{Track.last.id.floor(-3)}+"
  end
end

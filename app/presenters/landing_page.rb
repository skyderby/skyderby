class LandingPage
  def users_count
    "#{User.last.id.ceil(-2)}+"
  end

  def tracks_count
    "#{Track.last.id.floor(-3)}+"
  end

  def online_competitions_summary
    @online_competitions_summary ||= VirtualCompetitions::Summary.new
  end

  def contribution_summary
    @contribution_summary ||= Contribution::Summary.new
  end
end

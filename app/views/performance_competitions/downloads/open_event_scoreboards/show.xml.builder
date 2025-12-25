russia_restricted = @event.is_official && [2020, 2021].include?(@event.starts_at.year)

xml.instruct!
xml.EventResult do
  xml.UniqueCode "skyderby-performance-open-#{@event.id}"

  xml << render('performance_competitions/downloads/scoreboards/standings', standings: @scoreboard.standings,
                                                                            russia_restricted:)
end

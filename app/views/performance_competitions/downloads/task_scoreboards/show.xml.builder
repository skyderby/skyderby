# locals: (task:, standings:)

russia_restricted = @event.is_official && [2020, 2021].include?(@event.starts_at.year)

xml.instruct!
xml.EventResult do
  xml.UniqueCode "skyderby-performance-#{task}-#{@event.id}"

  xml << render('performance_competitions/downloads/scoreboards/standings', standings:, tasks: [task], russia_restricted:)
end

# locals: (category:, standings:)

russia_restricted = @event.is_official && [2020, 2021].include?(@event.starts_at.year)
tasks = %w[distance speed time]

xml.instruct!
xml.EventResult do
  xml.UniqueCode "skyderby-performance-#{@event.id}-#{category.id}"

  xml << render('performance_competitions/downloads/scoreboards/standings', standings:, tasks:, russia_restricted:)
end

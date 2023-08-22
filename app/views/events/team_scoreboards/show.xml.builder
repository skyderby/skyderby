xml.instruct!
xml.EventResult do
  xml.UniqueCode "skyderby-ws-performance-#{@event.id}-teams"
  @team_ranking.ranking.each_with_index do |row, index|
    xml.Entrant do
      xml.CompetitionNo "00#{index + 1}"
      xml.Name row.team.name
      xml.Members row.team.competitors.map(&:name).join(', ')
      xml.Nation row.team.competitors.map { _1.profile.country&.code }.compact.join(', ')
      xml.Rank index + 1
      xml.Total format('%.1f', row.total_points)
    end
  end
end

xml.instruct!
xml.EventResult do
  xml.UniqueCode @event.team_standings_code

  @standings.rows.each_with_index do |row, index|
    xml.Entrant do
      xml.CompetitionNo "00#{index + 1}"
      xml.Name row[:team].name
      xml.Nation row[:team].competitors.map { it.profile.country&.code }.uniq.compact.join(', ')
      xml.Rank row[:rank]
      xml.Total row[:total].present? ? format('%.1f', row[:total]) : ''
      xml.Members row[:team].competitors.map(&:name).join(', ')
    end
  end
end

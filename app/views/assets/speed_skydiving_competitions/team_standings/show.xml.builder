xml.instruct!
xml.EventResult do
  xml.UniqueCode "skyderby-speed-skydiving-#{@event.id}-teams"

  @standings.rows.each_with_index do |row, index|
    xml.Entrant do
      xml.CompetitionNo "00#{index + 1}"
      xml.Name row[:team].name
      xml.Members row[:team].competitors.map(&:name).join(', ')
      xml.Nation row[:team].competitors.map { _1.profile.country&.code }.compact.join(', ')
      xml.Rank row[:rank]
      xml.Total row[:total].present? ? format('%.1f', row[:total]) : ''
    end
  end
end

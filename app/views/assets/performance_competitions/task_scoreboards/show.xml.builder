xml.instruct!
xml.EventResult do
  xml.UniqueCode "skyderby-ws-performance-#{@event.id}-#{task}"

  standings.each do |row|
    xml.Entrant do
      xml.CompetitionNo row.competitor.assigned_number
      xml.Name row.competitor.name
      xml.Nation row.competitor.country_code
      xml.Rank row.rank
      xml.Total format('%.1f', row.total_points)

      xml.tag! task.capitalize do
        row.rounds.each do |round|
          xml.Flight(No: round.number) do
            record = row.result_in_round(round)
            if record
              formated_result =
                if task == 'distance'
                  format('%d', record.result.truncate)
                else
                  format('%.1f', record.result)
                end

              xml.tag! task.capitalize, formated_result
              xml.Percentage format('%.1f', record.points.round(1))
              xml.Notes(<<~HTML)
                <iframe src="https://skyderby.io/events/#{@event.id}/results/#{record.id}" height="700px" width="750px" />
              HTML
            else
              xml.tag! task.capitalize, ''
              xml.Percentage ''
            end
          end
        end
      end
    end
  end
end

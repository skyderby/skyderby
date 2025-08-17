# locals: (standings:, tasks:, russia_restricted: false)

standings.rows.each do |row|
  competitor = row.competitor

  xml.Entrant do
    xml.CompetitionNo competitor.assigned_number
    xml.Name competitor.name

    if russia_restricted && competitor.country_code == 'RUS'
      xml.Nation 'RPF'
    else
      xml.Nation competitor.country_code
    end

    xml.Rank row.rank
    xml.Total format('%.1f', row.total_points.to_f)

    tasks.each do |discipline|
      xml.tag! discipline.capitalize do
        rounds = standings.rounds.select { |round| round.discipline == discipline }
        if rounds.any?
          rounds.each do |round|
            result = row.result_in_round(round)

            xml.Flight(No: round.number) do
              if result
                xml.tag! discipline.to_s.capitalize, result.formatted_result
                xml.Percentage result.valid? ? format('%.1f', result.points.to_f.round(1)) : ''
                xml.Notes(<<~HTML)
                  <iframe src="#{performance_competition_result_url(@event, result)}" height="700px" width="750px" />
                HTML
              else
                xml.tag! discipline.to_s.capitalize, ''
                xml.Percentage ''
              end
            end
          end
        else
          xml.Flight(No: 1) do
            xml.tag! discipline.to_s.capitalize, ''
            xml.Percentage ''
          end
        end

        discipline_total = row.points_in_disciplines[discipline]
        xml.TaskPercentage rounds.any?(&:completed?) ? format('%.1f', discipline_total.to_f) : ''
      end
    end
  end
end

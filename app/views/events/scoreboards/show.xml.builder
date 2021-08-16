xml.instruct!
xml.EventResult do
  xml.UniqueCode "skyderby-ws-performance-#{@event.id}"

  @scoreboard.sections.each do |section|
    rank = 0
    previous_total = 0
    section.competitors.each_with_index do |competitor, index|
      rank = competitor.total_points == previous_total && total_points.positive? ? rank : index + 1

      xml.Entrant do
        xml.CompetitionNo competitor.assigned_number
        xml.Name competitor.name

        russia_restricted = @event.is_official && [2020, 2021].include?(@event.starts_at.year)
        if russia_restricted && competitor.country_code == 'RUS'
          xml.Nation 'RPF'
        else
          xml.Nation competitor.country_code
        end

        xml.Rank rank
        xml.Total format('%.1f', competitor.total_points)

        @scoreboard.rounds_by_discipline.each do |discipline, rounds|
          xml.tag! discipline.to_s.capitalize do
            rounds.select(&:completed).each do |round|
              result = @scoreboard.results.for(competitor: competitor, round: round)
              next unless result

              xml.Flight(No: round.number) do
                xml.tag! discipline.to_s.capitalize, result.formated
                xml.Percentage result.formated_points
                xml.Notes do
                  xml.iframe(src: event_result_url(@event, result), height: '700px', width: '500px')
                end
              end
            end

            xml.TaskPercentage competitor.points_in_discipline(discipline).round(1)
          end
        end
      end
    end
  end
end

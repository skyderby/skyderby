ordered_tasks = %w[distance speed time]

xml.instruct!
xml.EventResult do
  xml.UniqueCode "skyderby-ws-performance-#{@event.id}"

  @scoreboard.sections.each do |section|
    rank = 0
    previous_total = 0
    section.competitors.each_with_index do |competitor, index|
      rank = competitor.total_points == previous_total && competitor.total_points.positive? ? rank : index + 1
      previous_total = competitor.total_points

      xml.Entrant do
        xml.CompetitionNo competitor.assigned_number
        xml.Name competitor.name
        xml.Nation competitor.country_code
        xml.Rank rank
        xml.Total format('%.1f', competitor.total_points)

        ordered_tasks.each do |discipline|
          xml.tag! discipline.capitalize do
            rounds = @scoreboard.rounds.select { |round| round.discipline == discipline && round.completed }
            rounds.each do |round|
              result = @scoreboard.results.for(competitor: competitor, round: round)

              xml.Flight(No: round.number) do
                if result
                  xml.tag! discipline.to_s.capitalize, result.formated
                  xml.Percentage result.formated_points
                  xml.Notes(<<~HTML)
                    <iframe src=\"#{event_result_url(@event, result)}" height="700px" width="750px" />
                  HTML
                else
                  xml.tag! discipline.to_s.capitalize, ''
                  xml.Percentage ''
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

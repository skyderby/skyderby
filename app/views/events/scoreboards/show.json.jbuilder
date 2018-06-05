json.sections do
  json.array! @event.sections do |section|
    json.id section.id
    json.name section.name
    json.order section.order
  end
end

json.competitors do
  all_competitors = @scoreboard.sections.map { |section| section.competitors.to_a }.flatten
  json.array! all_competitors do |scoreboard_entry|
    json.id scoreboard_entry.id
    json.name scoreboard_entry.name
    json.section_id scoreboard_entry.section.id
    json.total_points scoreboard_entry.total_points.round(2)
    json.results do
      json.array! scoreboard_entry.results do |result|
        json.discipline result.round.discipline
        json.round result.round.number
        json.result result.formated
        json.points result.formated_points
      end
    end
  end
end

json.sections do
  json.array! @event.sections do |section|
    json.id section.id
    json.name section.name
    json.order section.order
  end
end

json.competitors do
  json.array! @scoreboard.sections.values.flatten do |scoreboard_entry|
    json.id scoreboard_entry.id
    json.name scoreboard_entry.name
    json.section_id scoreboard_entry.section_id
    json.total_points scoreboard_entry.total_points.round(2)
    json.results do
      json.array! scoreboard_entry.event_tracks do |result|
        json.discipline result.round_discipline
        json.round result.round.number
        json.result result.result
      end
    end
  end
end

json.sections do
  json.array! @event.sections.order(:order) do |section|
    json.id section.id
    json.name section.name
    json.order section.order
  end
end

json.rounds do
  json.array! @scoreboard.rounds do |round|
    json.extract! round, :id, :discipline, :number
  end
end

json.teams do
  json.array! @event.teams do |team|
    json.extract! team, :id, :name
  end
end

json.competitors do
  all_competitors = @scoreboard.sections.flat_map { |section| section.competitors.to_a }
  json.array! all_competitors do |scoreboard_entry|
    json.id scoreboard_entry.id
    json.name scoreboard_entry.name
    json.section_id scoreboard_entry.section.id
    json.team_id scoreboard_entry.team&.id
    json.country_code scoreboard_entry.country_code
    json.suit_name "#{scoreboard_entry.suit.manufacturer_code} #{scoreboard_entry.suit_name}"
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

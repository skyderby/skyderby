json.key_format! camelize: :lower

scoreboard = @scoreboard
group = scoreboard.group
disciplines = VirtualCompetition::Group::Scoreboard::DISCIPLINES
categories = scoreboard.populated_categories

json.group do
  json.id group.id
  json.name group.name
  json.subtitle t('virtual_competitions.groups.show.subtitle')
end

json.tabs do
  json.child! do
    json.type 'overall'
    json.label t('virtual_competitions.groups.navbar.overall')
  end
  group.years.each do |year|
    json.child! do
      json.type 'year'
      json.year year
      json.label year.to_s
    end
  end
end

json.filters do
  json.year scoreboard.year
  json.gender scoreboard.gender
  json.wind scoreboard.wind_cancellation
  json.genders scoreboard.gender_options do |value|
    json.value value
    json.label t("virtual_competitions.show.genders.#{value || 'open'}")
  end
  json.winds [false, true] do |value|
    json.value value
    json.label t("virtual_competitions.groups.actions_bar.#{value ? 'wind_cancelled' : 'raw'}")
  end
end

json.show_rank_changes scoreboard.show_rank_changes?
json.disciplines disciplines do |discipline|
  json.key discipline
  json.label t("disciplines.#{discipline}")
  json.unit combined_discipline_unit(discipline)
end

empty_message =
  if categories.any? then nil
  elsif scoreboard.any? then t('virtual_competitions.groups.show.no_results')
  else t('virtual_competitions.groups.show.not_available')
  end
json.empty_message empty_message

json.categories categories do |category|
  json.partial! 'api/v1/virtual_competitions/groups/category', category:, rows: category.rows
end

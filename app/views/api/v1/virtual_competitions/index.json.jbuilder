json.key_format! camelize: :lower

sections = [{ key: 'active', title: nil, groups: @index.active_groups }]
if @index.include_archived?
  sections << { key: 'finished', title: t('virtual_competitions.index.archived'), groups: @index.finished_groups }
end

json.include_archived @index.include_archived?
json.sections sections do |section|
  json.key section[:key]
  json.title section[:title]
  json.groups section[:groups] do |group|
    json.id group.id
    json.name group.name
    json.competitions_count group.size

    if group.combined_scoreboard?
      json.combined do
        json.athlete_count group.combined_athlete_count
        json.disciplines group.disciplines do |discipline|
          json.key discipline
          json.label t("disciplines.#{discipline}")
        end
        json.categories group.categories do |category|
          json.suit_kind category.suit_kind
          json.name category.name
          json.cells category.cells do |cell|
            json.discipline cell.discipline
            json.competition_id cell.competition.id
            json.competition_name cell.competition.name
            json.athlete_count cell.athlete_count
          end
        end
      end
    else
      json.combined nil
    end

    json.competitions group.cards do |competition|
      json.partial! 'api/v1/virtual_competitions/competition_summary',
                    competition:, athlete_count: @index.athlete_count(competition)
    end
  end
end

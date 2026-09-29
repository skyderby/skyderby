json.key_format! camelize: :lower

competition = @competition

json.competition do
  json.partial! 'api/v1/virtual_competitions/competition_summary',
                competition:, athlete_count: competition.personal_top_scores.wind_cancellation(false).count

  json.group do
    json.id competition.group.id
    json.name competition.group.name
    json.has_combined_scoreboard competition.group.combined_scoreboard?
  end

  if competition.place
    json.place { json.partial! 'api/v1/virtual_competitions/place', place: competition.place }
  else
    json.place nil
  end

  if competition.finish_line
    json.finish_line do
      json.id competition.finish_line.id
      json.name competition.finish_line.name
    end
  else
    json.finish_line nil
  end

  json.period_from competition.period_from
  json.period_to competition.period_to
  json.interval_type competition.interval_type
  json.results_sort_order competition.results_sort_order
  json.unit competition_unit(competition)
  json.task competition_task(competition)
  json.suit_label competition_suit(competition)
  json.display_highest_speed competition.display_highest_speed.present?
  json.display_highest_gr competition.display_highest_gr.present?
  json.comparable_in_pro_view competition.comparable_in_pro_view?

  json.filters do
    json.partial! 'api/v1/virtual_competitions/filter_options',
                  jump_kinds: competition.jump_kind_options, genders: competition.gender_options
  end

  json.tabs do
    json.child! do
      json.type 'overall'
      json.label t('virtual_competitions.navbar.overall')
      json.path api_v1_virtual_competition_overall_path(competition)
    end

    if competition.annual?
      competition.years.each do |year|
        json.child! do
          json.type 'year'
          json.year year
          json.label year.to_s
          json.path api_v1_virtual_competition_year_path(competition, year)
        end
      end
    else
      competition.intervals.each do |interval|
        json.child! do
          json.type 'period'
          json.slug interval.slug
          json.label interval.name
          json.period_from interval.period_from&.utc&.iso8601
          json.period_to interval.period_to&.utc&.iso8601
          json.path api_v1_virtual_competition_period_path(competition, interval)
        end
      end
    end
  end

  json.default_tab do
    if competition.annual?
      json.type 'year'
      json.year competition.last_year
    elsif competition.last_interval
      json.type 'period'
      json.slug competition.last_interval.slug
    else
      json.type 'overall'
    end
  end

  json.sponsors competition.sponsors do |sponsor|
    json.id sponsor.id
    json.name sponsor.name
    json.website sponsor.website
    json.logo_url stored_file_url(sponsor.logo_url(:medium))
  end
end

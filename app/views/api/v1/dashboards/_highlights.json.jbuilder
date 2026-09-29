case dashboard.current_mode
when :performance
  json.array! Profiles::Dashboard::DISCIPLINES.zip(dashboard.personal_bests) do |discipline, best|
    if discipline == :flare && best.nil?
      json.partial! 'api/v1/dashboards/count_highlight', type: :jumps, value: dashboard.jumps_count
    else
      json.partial! 'api/v1/dashboards/personal_best', best:, discipline:,
                                                       label: t("dashboard.disciplines.#{discipline}")
    end
  end
when :base
  flare = dashboard.base_flare
  highlights = [flare ? [:flare, flare] : [:locations, nil]] + dashboard.base_race_bests.map { |best| [:race, best] }
  json.array! highlights do |type, best|
    case type
    when :locations
      json.partial! 'api/v1/dashboards/count_highlight', type: :locations, value: dashboard.locations_count
    when :flare
      json.partial! 'api/v1/dashboards/personal_best', best:, discipline: :flare, label: t('dashboard.base_flare')
    else
      json.partial! 'api/v1/dashboards/personal_best', best:, discipline: best.discipline,
                                                       label: dashboard_discipline_label(best.competition)
    end
  end
when :speed
  if dashboard.speed_pb
    json.array! %i[personal_best p95] do |type|
      value = type == :p95 ? dashboard.speed_p95 : dashboard.speed_pb
      json.type type
      json.discipline :speed
      json.prefix type == :p95 ? t('dashboard.p95') : t('dashboard.personal_bests.prefix')
      json.label t('dashboard.disciplines.speed')
      json.value value
      json.formatted_value value.round(1).to_s
      json.unit t('units.kmh')
      json.delta nil
      json.formatted_delta nil
      json.track_id type == :p95 ? nil : dashboard.speed_pb_track_id
      json.competition_id nil
    end
  else
    json.array! [:jumps] do |type|
      json.partial! 'api/v1/dashboards/count_highlight', type:, value: dashboard.jumps_count
    end
  end
else
  json.array! []
end

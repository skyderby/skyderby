module DashboardHelper
  PERSONAL_BEST_RANGE_FROM = 2500
  PERSONAL_BEST_RANGE_TO = 1500

  def personal_best_track_path(personal_best)
    return if personal_best.nil? || personal_best.track_id.nil?

    competition = personal_best.competition
    return unless competition.comparable_in_pro_view?

    if competition.base?
      track_path(personal_best.track_id, result_competition_id: competition.id)
    elsif competition.speed_skydiving?
      track_path(personal_best.track_id)
    else
      track_path(
        personal_best.track_id,
        f: PERSONAL_BEST_RANGE_FROM,
        t: PERSONAL_BEST_RANGE_TO,
        'straight-line': true
      )
    end
  end

  def dashboard_pb_value_tag(track_link, &)
    classes = class_names('dashboard-pb__value', 'dashboard-pb__value--link' => track_link)
    content_tag(track_link ? :a : :div, class: classes, href: track_link, &)
  end

  def dashboard_discipline_label(competition)
    case competition.discipline
    when 'distance_in_time'
      t('dashboard.disciplines.distance_in_time', seconds: competition.discipline_parameter)
    when 'distance_in_altitude'
      t('dashboard.disciplines.distance_in_altitude', meters: competition.discipline_parameter)
    else
      t("dashboard.disciplines.#{competition.discipline}")
    end
  end
end

module DashboardHelper
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

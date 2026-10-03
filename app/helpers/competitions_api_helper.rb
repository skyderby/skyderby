module CompetitionsApiHelper
  COMPETITOR_PRELOADS = [
    :competitor_alias,
    { photo_attachment: :blob },
    { profile: [:country, :owner, { userpic_attachment: :blob }] }
  ].freeze

  def preload_competitors(competitors, *associations)
    records = competitors.to_a
    ActiveRecord::Associations::Preloader.new(records:, associations: COMPETITOR_PRELOADS + associations).call
    records
  end

  def competitor_profile_owned_by_event?(competitor)
    owner = competitor.profile&.owner
    owner.present? && !owner.is_a?(User)
  end

  def competition_type(record) = record.class.name.underscore

  def discipline_label(discipline) = t("disciplines.#{discipline}")

  def discipline_unit_label(discipline) = t("units.#{discipline_unit(discipline)}")

  def performance_round_label(round) = "#{discipline_label(round.discipline)} #{round.number}"

  def format_discipline_value(discipline, value)
    return if value.nil?

    DisciplinesHelper::DISTANCE_DISCIPLINES.include?(discipline.to_s) ? format('%d', value) : format('%.1f', value)
  end

  def format_points(value) = value.nil? ? nil : format('%.1f', value.to_f.round(1))

  def format_speed(value) = value.nil? ? nil : format('%.2f', value)

  def format_race_time(value) = value.nil? ? nil : format('%.3f', value)

  def api_float(value, precision = nil)
    return if value.nil?

    precision ? value.to_f.round(precision) : value.to_f
  end
end

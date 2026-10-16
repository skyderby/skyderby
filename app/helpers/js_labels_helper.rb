module JsLabelsHelper
  JS_LABEL_SETS = {
    units: %w[units.m units.ft units.kmh units.mph units.ms units.sec],
    charts: %w[
      charts.compare
      charts.all_data.series
      charts.gr.title
      charts.gr.series.wind_effect
      charts.spd.title
      charts.spd.series.wind_effect
      charts.sep.series
      charts.elev.title
      charts.elev.series
      charts.speed_skydiving
      tracks.speed_pro.metrics.position
    ],
    track_show: %w[tracks.show.no_data tracks.show.load_error],
    side_view: %w[
      tracks.side_view.reset_zoom
      tracks.side_view.zoom_to_exit
      tracks.side_view.zoom_all
    ],
    polar: %w[charts.polar],
    base_summary: %w[tracks.base_pro.summary tracks.base_pro.tooltip],
    speed_pro: %w[
      tracks.speed_pro.chart
      tracks.speed_pro.col_track
      tracks.speed_pro.col_comparison
      tracks.speed_pro.metrics
      tracks.speed_pro.summary
      tracks.speed_pro.tooltip
      tracks.speed_pro.waterfall
    ],
    flight_profiles: %w[
      flight_profiles.zoom_all
      flight_profiles.zoom_to_first
      flight_profiles.full_speed
      flight_profiles.ground_speed
      flight_profiles.vertical_speed
      flight_profiles.distance_traveled
      flight_profiles.distance_to_terrain
    ],
    video_form: %w[
      tracks.edit.elev_chart
      tracks.edit.elevation
      charts.spd.series.ground
      charts.spd.series.vertical
    ],
    terrain_profile_form: %w[terrain_profiles.form.import_csv_failed]
  }.freeze

  def js_labels(*sets)
    sets
      .flat_map { |set| JS_LABEL_SETS.fetch(set) }
      .each_with_object({}) { |key, labels| flatten_label(key, t(key), labels) }
      .to_json
  end

  def dual_type_field_labels(kind)
    prefix = 'data-tracks--dual-type-field'
    tag.attributes(
      "#{prefix}-select-link-value": t("tracks.form.toggle_#{kind}_link"),
      "#{prefix}-select-caption-value": t("tracks.form.toggle_#{kind}_caption"),
      "#{prefix}-text-link-value": t("tracks.form.toggle_#{kind}_link_select"),
      "#{prefix}-text-caption-value": t("tracks.form.toggle_#{kind}_caption_select")
    )
  end

  private

  def flatten_label(key, value, labels)
    if value.is_a?(Hash)
      value.each { |name, nested| flatten_label("#{key}.#{name}", nested, labels) }
    else
      labels[key] = value
    end
  end
end

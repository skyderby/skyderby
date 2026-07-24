module JournalsHelper
  def journal_unit_label(unit)
    t("units.#{unit}")
  end

  def journal_chart_data(journal, task)
    {
      key: task.key,
      higherIsBetter: task.higher_is_better,
      unit: journal_unit_label(task.unit),
      pilot: journal.name,
      kind: journal.current_activity,
      series: task.series.map { |series| journal_series_data(task, series) }
    }
  end

  private

  def journal_series_data(task, series)
    {
      key: series.key,
      label: journal_series_label(task, series.key),
      points: series.points.map do |point|
        {
          x: point.x,
          y: point.y,
          date: point.date,
          trackId: point.track_id,
          trackUrl: track_path(point.track_id),
          suit: point.suit && suit_presentation(point.suit),
          place: point.place && place_presentation(point.place),
          comment: point.comment
        }
      end
    }
  end

  def journal_series_label(task, key)
    case task.key
    when :speed
      key == 'unknown' ? t('journal.series.no_suit') : t("dashboard.suit_types.#{key}", default: key.to_s.humanize)
    when :distance_in_time
      t('journal.series.seconds', seconds: key)
    when :base_race
      key
    end
  end
end

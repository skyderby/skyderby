module ExitPerformancesHelper
  include UnitsHelper

  def exit_performance_chart_data(dashboard)
    {
      unit: t("units.#{altitude_units_by_type(Current.charts_units)}"),
      labels: exit_performance_labels,
      series: dashboard.exit_performances.map { |performance| exit_performance_series(performance) }
    }
  end

  def suit_exit_performance_chart_data(performances)
    {
      unit: t("units.#{altitude_units_by_type(Current.charts_units)}"),
      labels: exit_performance_labels,
      series: performances.map do |performance|
        {
          key: performance.id,
          label: performance.suit.name,
          samples: exit_performance_samples(performance)
        }
      end
    }
  end

  def exit_performance_suit_name(performance)
    suit = performance.suit
    [suit.manufacturer&.code, suit.name].compact_blank.join(' ')
  end

  private

  def exit_performance_labels
    {
      drop: t('dashboard.exit_performance.axis_drop'),
      distance: t('dashboard.exit_performance.axis_distance'),
      median: t('dashboard.exit_performance.median'),
      flat: t('dashboard.exit_performance.flat')
    }
  end

  def exit_performance_series(performance)
    {
      key: performance.id,
      label: exit_performance_suit_name(performance),
      jumps: performance.tracks_count,
      samples: exit_performance_samples(performance)
    }
  end

  def exit_performance_samples(performance)
    performance.samples.map do |sample|
      {
        drop: exit_performance_value(sample['drop']),
        low: exit_performance_value(sample['low']),
        q1: exit_performance_value(sample['q1']),
        mid: exit_performance_value(sample['mid']),
        q3: exit_performance_value(sample['q3']),
        high: exit_performance_value(sample['high']),
        flat: exit_performance_value(sample['flat'])
      }
    end
  end

  def exit_performance_value(meters)
    value = Current.charts_units.imperial? ? m_to_ft(meters) : meters
    value.round
  end
end

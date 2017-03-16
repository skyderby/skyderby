module Tracks
  module ChartPreferences
    def single_chart?
      chart_preferences.single?
    end

    def separate_charts?
      chart_preferences.separate?
    end

    def metric_units?
      chart_preferences.metric?
    end

    def imperial_units?
      chart_preferences.imperial?
    end

    def speed_units
      @speed_units ||= chart_preferences.unit_system.speed
    end

    def distance_units
      @distance_units ||= chart_preferences.unit_system.distance
    end

    def altitude_units
      @altitude_units ||= chart_preferences.unit_system.altitude
    end
  end
end

module Skyderby
  module ResultsProcessors
    class DistanceInAltitude
      def initialize(track_points, params)
        @distance = 0
        @highest_gr = 0
        @highest_speed = 0

        @start_altitude = 0
        @start_found = false

        @trk_points = track_points.trimmed(start: track_points.ff_start - 10)

        validate! params
        @altitude = params[:altitude]
        @speed_key = params[:is_flysight] ? :v_speed : :raw_v_speed
      end

      def calculate
        prev_point = nil

        @trk_points.each do |cur_point|
          # break if track trimmed to point after exit
          break if !prev_point && cur_point[:v_speed] > 10

          if prev_point
            if cur_point[@speed_key] >= 10 && !@start_found
              @start_found = true
              # Коэффициент необходим для определения какой участок пути мы засчитываем в результат.
              # По правилам начинаем считать от точки где пилот достиг вертикальной скорости 10 км/ч
              # Если в предыдущей точке пилот имел скорость 4 км/ч, а в текущей имеет 14
              # то засчитываем 0.4 пройденного расстояния
              # соответственно нам необходимо найти точку удаленную на 0.6 расстояния от предыдущей, либо на
              # 0.4 в противоположном направлении
              k = (cur_point[@speed_key] - 10) / (cur_point[@speed_key] - prev_point[@speed_key])

              # Если К = 0.4 то точка начала должна быть удалена от текущей на 0.4 в направлении предыдущей,
              # То есть 0.6 пути от предыдущей точки до текущей не учитываем.
              @start_lat = cur_point[:latitude] - (prev_point[:latitude] - cur_point[:latitude]) * k
              @start_lon = cur_point[:longitude] - (prev_point[:latitude] - cur_point[:latitude]) * k

              @start_altitude += cur_point[:abs_altitude] - (prev_point[:abs_altitude] - cur_point[:abs_altitude]) * k

              prev_point = cur_point
              next
            end

            if @start_found
              if @start_altitude - cur_point[:abs_altitude] < @altitude

                @highest_gr = cur_point[:glrat] if cur_point[:glrat] > @highest_gr
                @highest_speed = cur_point[:h_speed] if cur_point[:h_speed] > @highest_speed
              else
                k = (@altitude - (@start_altitude - prev_point[:abs_altitude])) / (@start_altitude - cur_point[:abs_altitude])

                @end_lat = cur_point[:latitude] - (cur_point[:latitude] - prev_point[:latitude]) * k
                @end_lon = cur_point[:longitude] - (cur_point[:longitude] - prev_point[:longitude]) * k

                break
              end
            end
          end

          prev_point = cur_point
        end

        if @start_lat && @start_lon && @end_lat && @end_lon
          @distance =
            Skyderby::Geospatial.distance(
              [@start_lat, @start_lon],
              [@end_lat, @end_lon]
            )
        end

        {
          result: @distance,
          highest_gr: @highest_gr,
          highest_speed: @highest_speed
        }
      end

      def validate!(params)
        fail ArgumentError, 'Params should be the hash' unless params.is_a? Hash
        fail ArgumentError, 'Params should contain altitude' unless params[:altitude]
        fail ArgumentError, 'Params should contain is_flysight' if params[:is_flysight].nil?
      end
    end
  end
end

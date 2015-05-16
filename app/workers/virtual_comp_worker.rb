require 'geospatial'
require 'competitions/results_processor'
require 'skyderby/tracks/points'

class VirtualCompWorker
  include Sidekiq::Worker

  def perform(track_id)
    track = Track.find(track_id)
    track.virtual_comp_results.each(&:delete)
    return unless track.public_track?
    return unless track.wingsuit && track.pilot

    data = Skyderby::Tracks::Points.new(track)

    competitions = OnlineEventsFinder.new.execute(track)
    competitions.each do |comp|
      tmp_result = VirtualCompResult.new
      tmp_result.user_profile_id = track.user_profile_id
      tmp_result.virtual_competition_id = comp.id


      if comp.distance_in_time?
        result_hash = calculate_distance_in_time(data, comp.discipline_parameter, track.flysight?)
        tmp_result.result = result_hash[:distance]
        tmp_result.highest_gr = result_hash[:highest_gr] if comp.display_highest_gr
        tmp_result.highest_speed = result_hash[:highest_speed] if comp.display_highest_speed
      elsif comp.distance? || comp.speed? || comp.time?
        range = {
          range_from: comp.range_from,
          range_to: comp.range_to
        }
        tmp_result.result = 
          ResultsProcessor.process data, comp.discipline.to_sym, range

        # result_hash = calculate(data, comp.range_from, comp.range_to)
        # tmp_result.result = result_hash[:distance] if comp.distance?
        # tmp_result.result = result_hash[:speed] if comp.speed?
        # tmp_result.result = result_hash[:time] if comp.time?
      end
      track.virtual_comp_results << tmp_result if tmp_result.result > 0
    end
  end

  def calculate_distance_in_time(data, discipline_parameter, is_flysight)
    # method return values
    distance = 0
    highest_gr = 0
    highest_speed = 0
    
    # tmp values
    fl_time = 0
    prev_point = nil
    start_found = false
    trk_points = data.trimmed(start: data.ff_start - 10)
    speed_key = is_flysight ? :v_speed : :raw_v_speed

    start_lat = nil
    start_lon = nil
    end_lat = nil
    end_lon = nil

    trk_points.each do |cur_point|
      break if fl_time >= discipline_parameter
      # break if track trimmed to point after exit
      break if !prev_point && cur_point[:v_speed] > 10

      if prev_point
        if cur_point[speed_key] >= 10 && !start_found
          start_found = true
          # Коэффициент необходим для определения какой участок пути мы засчитываем в результат.
          # По правилам начинаем считать от точки где пилот достиг вертикальной скорости 10 км/ч
          # Если в предыдущей точке пилот имел скорость 4 км/ч, а в текущей имеет 14
          # то засчитываем 0.4 пройденного расстояния
          # соответственно нам необходимо найти точку удаленную на 0.6 расстояния от предыдущей, либо на
          # 0.4 в противоположном направлении
          k = (cur_point[speed_key] - 10) / (cur_point[speed_key] - prev_point[speed_key])

          # Если К = 0.4 то точка начала должна быть удалена от текущей на 0.4 в направлении предыдущей,
          # То есть 0.6 пути от предыдущей точки до текущей не учитываем.
          start_lat = cur_point[:latitude] - (prev_point[:latitude] - cur_point[:latitude]) * k
          start_lon = cur_point[:longitude] - (prev_point[:latitude] - cur_point[:latitude]) * k

          fl_time += cur_point[:fl_time] * k

          prev_point = cur_point
          next
        end

        if start_found
          if fl_time + cur_point[:fl_time] < discipline_parameter
            fl_time += cur_point[:fl_time]

            highest_gr = cur_point[:glrat] if cur_point[:glrat] > highest_gr
            highest_speed = cur_point[:h_speed] if cur_point[:h_speed] > highest_speed
          else
            k = (fl_time + cur_point[:fl_time] - discipline_parameter) / cur_point[:fl_time]
            fl_time += cur_point[:fl_time] * (1 - k)

            end_lat = cur_point[:latitude] - (cur_point[:latitude] - prev_point[:latitude]) * k
            end_lon = cur_point[:longitude] - (cur_point[:longitude] - prev_point[:longitude]) * k
          end
        end
      end

      prev_point = cur_point
    end

    if start_lat && start_lon && end_lat && end_lon
      distance =
        Geospatial.distance(
          [start_lat, start_lon],
          [end_lat, end_lon]
        )
    end

    { distance: distance, highest_gr: highest_gr, highest_speed: highest_speed }
  end

  # def calculate_distance_in_time(data, discipline_parameter, is_flysight)
  #   # method return values
  #   distance = 0
  #   highest_gr = 0
  #   highest_speed = 0
  #
  #   # tmp values
  #   fl_time = 0
  #   prev_point = nil
  #   start_found = false
  #   trk_points = data.trimmed(start: data.ff_start - 10)
  #   speed_key = is_flysight ? :v_speed : :raw_v_speed
  #
  #   trk_points.each do |cur_point|
  #     break if fl_time >= discipline_parameter
  #     # break if track trimmed to point after exit
  #     break if !prev_point && cur_point[:v_speed] > 10
  #
  #     if prev_point
  #       if cur_point[speed_key] >= 10 && !start_found
  #         start_found = true
  #         k = (cur_point[speed_key] - 10) / (cur_point[speed_key] - prev_point[speed_key])
  #         fl_time += cur_point[:fl_time] * k
  #         distance += cur_point[:distance] * k
  #
  #         prev_point = cur_point
  #         next
  #       end
  #
  #       if start_found
  #         if fl_time + cur_point[:fl_time] < discipline_parameter
  #           fl_time += cur_point[:fl_time]
  #           distance += cur_point[:distance]
  #
  #           highest_gr = cur_point[:glrat] if cur_point[:glrat] > highest_gr
  #           highest_speed = cur_point[:h_speed] if cur_point[:h_speed] > highest_speed
  #         else
  #           k = (fl_time + cur_point[:fl_time] - discipline_parameter) / cur_point[:fl_time]
  #           fl_time += cur_point[:fl_time] * (1 - k)
  #           distance += cur_point[:distance] * (1 - k)
  #         end
  #       end
  #     end
  #
  #     prev_point = cur_point
  #   end
  #
  #   { distance: distance, highest_gr: highest_gr, highest_speed: highest_speed }
  # end
end

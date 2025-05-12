class SuitPerformanceStatsJob < ApplicationJob
  queue_as :default

  def perform
  end

  def calculate_average_total_speed_per_user
    glide_ratio_step = 0.05
    user_data = Hash.new { |hash, key| hash[key] = [] }

    DataPoint.find_in_batches(batch_size: 1000) do |batch|
      batch.each do |data_point|
        glide_ratio = (data_point.glide_ratio / glide_ratio_step).floor * glide_ratio_step
        user_data[data_point.user_id] << { glide_ratio: glide_ratio, total_speed: data_point.total_speed }
      end
    end

    user_averages = {}

    user_data.each do |user_id, data_points|
      grouped_by_glide_ratio = data_points.group_by { |dp| dp[:glide_ratio] }
      averages_by_glide_ratio = {}

      grouped_by_glide_ratio.each do |glide_ratio, points|
        sorted_speeds = points.map { |p| p[:total_speed] }.sort
        count = sorted_speeds.size
        lower_bound = (count * 0.25).ceil
        upper_bound = (count * 0.90).floor
        filtered_speeds = sorted_speeds[lower_bound...upper_bound]
        average_speed = filtered_speeds.sum / filtered_speeds.size.to_f
        averages_by_glide_ratio[glide_ratio] = average_speed
      end

      user_averages[user_id] = averages_by_glide_ratio.values.sum / averages_by_glide_ratio.size.to_f
    end

    overall_average = user_averages.values.sum / user_averages.size.to_f

    { user_averages: user_averages, overall_average: overall_average }
  end
end

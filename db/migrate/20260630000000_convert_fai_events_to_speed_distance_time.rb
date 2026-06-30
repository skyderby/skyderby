class ConvertFaiEventsToSpeedDistanceTime < ActiveRecord::Migration[8.1]
  def change
    up_only do
      Event.where(rules: :fai).update_all(rules: Event.rules[:speed_distance_time])
    end
  end
end

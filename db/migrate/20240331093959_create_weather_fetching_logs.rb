class CreateWeatherFetchingLogs < ActiveRecord::Migration[7.0]
  def change
    create_table :weather_fetching_logs do |t|
      t.datetime :time
      t.text :errors

      t.timestamps
    end
  end
end

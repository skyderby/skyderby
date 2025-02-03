class RenameWeatherFetchingLogErrors < ActiveRecord::Migration[7.1]
  def change
    rename_column :weather_fetching_logs, :errors, :error_description
  end
end

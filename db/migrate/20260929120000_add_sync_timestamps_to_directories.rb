class AddSyncTimestampsToDirectories < ActiveRecord::Migration[8.1]
  SYNCED_TABLES = %i[countries manufacturers suits places place_finish_lines].freeze

  def change
    add_timestamps :countries, null: false, default: -> { 'CURRENT_TIMESTAMP' }
    add_timestamps :manufacturers, null: false, default: -> { 'CURRENT_TIMESTAMP' }

    SYNCED_TABLES.each { |table| add_index table, %i[updated_at id] }
  end
end

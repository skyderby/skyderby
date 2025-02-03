class SetIsOfficialDefault < ActiveRecord::Migration[6.0]
  def change
    change_column_default :events, :is_official, from: nil, to: false

    up_only { PerformanceCompetition.where(is_official: nil).update_all(is_official: false) }
  end
end

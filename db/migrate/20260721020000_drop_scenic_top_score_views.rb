class DropScenicTopScoreViews < ActiveRecord::Migration[8.1]
  VIEWS = %w[
    personal_top_scores
    interval_top_scores
    annual_top_scores
    virtual_competition_group_overall_standing_rows
    virtual_competition_group_annual_standing_rows
  ].freeze

  def up
    VIEWS.each { |view| execute "DROP VIEW IF EXISTS #{view}" }
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end

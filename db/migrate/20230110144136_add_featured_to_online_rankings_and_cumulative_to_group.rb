class AddFeaturedToOnlineRankingsAndCumulativeToGroup < ActiveRecord::Migration[7.0]
  def change
    add_column :virtual_competition_groups, :cumulative, :boolean, default: false, null: false
    add_column :virtual_competition_groups, :featured, :boolean, default: false, null: false
    add_column :virtual_competitions, :featured, :boolean, default: false, null: false
  end
end

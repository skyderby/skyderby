class MoveDisplayOnStartPageToCompetition < ActiveRecord::Migration
  def change
    remove_column :virtual_comp_groups, :display_on_start_page
    add_column :virtual_competitions, :display_on_start_page, :boolean, default: false

    VirtualCompetition.all.each { |x| x.update_columns(display_on_start_page: false) }
  end
end

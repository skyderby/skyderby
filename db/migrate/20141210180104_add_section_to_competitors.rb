class AddSectionToCompetitors < ActiveRecord::Migration
  def change
    add_reference :competitors, :section
  end
end

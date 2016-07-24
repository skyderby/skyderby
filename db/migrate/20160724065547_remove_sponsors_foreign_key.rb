class RemoveSponsorsForeignKey < ActiveRecord::Migration
  def change
    remove_foreign_key :sponsors, column: 'sponsorable_id'
  end
end

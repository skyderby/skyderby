class AddCountryToPlace < ActiveRecord::Migration
  def change
    add_reference :places, :country
  end
end

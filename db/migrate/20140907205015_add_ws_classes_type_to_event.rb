class AddWsClassesTypeToEvent < ActiveRecord::Migration
  def change
    add_column :events, :merge_intermediate_and_rookie, :boolean
    add_column :events, :allow_tracksuits, :boolean
  end
end

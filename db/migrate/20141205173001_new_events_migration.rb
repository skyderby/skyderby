class NewEventsMigration < ActiveRecord::Migration
  def change
    # Tables
    drop_table :invitations
    drop_table :ws_classes
    drop_table :user_wingsuits
    drop_table :participation_forms
    drop_table :organizers
    drop_table :event_documents
    drop_table :disciplines

    # Competitors
    remove_column :competitors, :participation_form_id

    # Events
    remove_column :events, :allow_tracksuits
    remove_column :events, :descriprion
    remove_column :events, :dz_info
    remove_column :events, :start_at
    remove_column :events, :end_at
    remove_column :events, :finished
    remove_column :events, :form_info
    remove_column :events, :merge_intermediate_and_rookie
    remove_column :events, :reg_starts
    remove_column :events, :reg_ends

    rename_column :events, :comp_range_from, :range_from
    rename_column :events, :comp_range_to, :range_to
  end
end

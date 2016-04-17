class ChangeEventSponsorToSponsorable < ActiveRecord::Migration
  def change
    rename_table :event_sponsors, :sponsors
    rename_column :sponsors, :event_id, :sponsorable_id
    add_column :sponsors, :sponsorable_type, :string
    Sponsor.reset_column_information
    Sponsor.update_all(sponsorable_type: 'Event')
  end
end

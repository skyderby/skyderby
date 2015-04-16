class AddAttachmentToTracks < ActiveRecord::Migration
  def change
    add_attachment :tracks, :file
  end
end

class AddRefsInvites < ActiveRecord::Migration
  def change
    add_reference :invitations, :user, index: true
    add_reference :invitations, :event
  end
end

class ChangeWrongColumnUserWingsuit < ActiveRecord::Migration
  def change
    remove_reference :user_wingsuits, :wingsuits
    add_reference :user_wingsuits, :wingsuit
  end
end

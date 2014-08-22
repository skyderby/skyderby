class Wingsuit < ActiveRecord::Base
  belongs_to :manufacturer
  belongs_to :ws_class
  has_many :user_wingsuits
  has_many :users, :through => :user_wingsuits
end

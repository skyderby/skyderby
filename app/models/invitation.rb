class Invitation < ActiveRecord::Base
  belongs_to :user
  belongs_to :event
  has_one :competitor, :as => :participatable
end

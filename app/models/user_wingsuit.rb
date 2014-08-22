class UserWingsuit < ActiveRecord::Base
  belongs_to :user
  belongs_to :wingsuit
end

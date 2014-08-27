class Assignment < ActiveRecord::Base
  belongs_to :user, dependent: :destroy
  belongs_to :role, dependent: :destroy
end

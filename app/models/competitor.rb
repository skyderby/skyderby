class Competitor < ActiveRecord::Base
  belongs_to :event
  belongs_to :user
  belongs_to :based_on, :as => :participatable, :polymorphic => true
end

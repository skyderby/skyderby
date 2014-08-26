class Competitor < ActiveRecord::Base
  belongs_to :event
  belongs_to :user
  belongs_to :participation_form
end

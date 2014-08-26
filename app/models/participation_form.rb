class ParticipationForm < ActiveRecord::Base
  belongs_to :user
  belongs_to :event
  belongs_to :wingsuit
  has_one :competitor
end

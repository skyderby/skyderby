class EventDocument < ActiveRecord::Base
  belongs_to :event

  has_attached_file :attached_file
end

class Event::Round::ReferencePointAssignment < ApplicationRecord
  belongs_to :round
  belongs_to :competitor
  belongs_to :reference_point
end

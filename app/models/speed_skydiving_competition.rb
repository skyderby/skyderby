class SpeedSkydivingCompetition < ApplicationRecord
  enum status: { draft: 0, published: 1, finished: 2, surprise: 3 }
  enum visibility: { public_event: 0, unlisted_event: 1, private_event: 2 }

  belongs_to :responsible, class_name: 'User', inverse_of: :responsible_of_events
  belongs_to :place
end

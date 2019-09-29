class Event::Team < ApplicationRecord
  include Event::Namespace

  has_many :competitors, dependent: :restrict_with_error
end

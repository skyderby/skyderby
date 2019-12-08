class Event::Team < ApplicationRecord
  include Event::Namespace

  has_many :competitors, dependent: :nullify
end

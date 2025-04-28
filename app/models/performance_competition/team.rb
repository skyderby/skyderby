class PerformanceCompetition::Team < ApplicationRecord
  include PerformanceCompetition::Namespace

  has_many :competitors, dependent: :nullify
end

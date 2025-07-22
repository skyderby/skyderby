class PerformanceCompetition::ReferencePointAssignment < ApplicationRecord
  self.table_name = :event_reference_point_assignments

  belongs_to :round
  belongs_to :competitor
  belongs_to :reference_point
end

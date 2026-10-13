class VirtualCompetition::Discipline < ApplicationRecord
  belongs_to :virtual_competition
  has_many :results, inverse_of: :discipline, dependent: :delete_all

  enum :discipline, VirtualCompetition::DISCIPLINES

  delegate :finish_line, to: :virtual_competition

  def discipline_parameter = parameter

  def multi_discipline? = false

  def task = VirtualCompetition.task_for(discipline)

  def results_sort_order = base_race? ? 'ascending' : 'descending'
end

class VirtualCompetition::Discipline < ApplicationRecord
  belongs_to :virtual_competition
  has_many :results, inverse_of: :discipline, dependent: :delete_all

  enum :discipline, VirtualCompetition::DISCIPLINES

  delegate :finish_line, to: :virtual_competition

  before_save { self.results_sort_order = VirtualCompetition.results_sort_order_for(discipline) }

  def discipline_parameter = parameter

  def multi_discipline? = false

  def task = VirtualCompetition.task_for(discipline)
end

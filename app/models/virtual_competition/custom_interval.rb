class VirtualCompetition::CustomInterval < ApplicationRecord
  belongs_to :virtual_competition

  scope :until, ->(time) { where('period_from <= ?', time) }

  before_save :generate_slug

  def to_param
    slug
  end

  private

  def generate_slug
    self.slug = name.parameterize
  end
end

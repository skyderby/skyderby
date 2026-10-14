class VirtualCompetition::CustomInterval < ApplicationRecord
  belongs_to :virtual_competition

  scope :until, ->(time) { where(period_from: ..time) }

  before_save :generate_slug

  def to_param
    slug
  end

  def recorded_range
    return period_from..period_to unless ends_at_midnight?

    next_interval_starts_at_end? ? period_from...period_to : period_from..period_to.end_of_day
  end

  private

  def ends_at_midnight? = period_to.present? && period_to == period_to.beginning_of_day

  def next_interval_starts_at_end?
    virtual_competition.custom_intervals.where.not(id:).exists?(period_from: period_to)
  end

  def generate_slug
    self.slug = name.parameterize
  end
end

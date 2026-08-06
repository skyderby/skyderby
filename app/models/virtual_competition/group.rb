# == Schema Information
#
# Table name: virtual_competition_groups
#
#  id         :integer          not null, primary key
#  name       :string(510)
#  created_at :datetime
#  updated_at :datetime
#

class VirtualCompetition::Group < ApplicationRecord
  has_many :virtual_competitions, dependent: :restrict_with_error

  validates :name, presence: true

  def scoreboard(**) = Scoreboard.new(self, **)

  def years = virtual_competitions.select(&:annual?).flat_map(&:years).uniq.sort

  def combined_scoreboard? = combined_categories.any?

  def combined_categories = @combined_categories ||= Scoreboard.categorize(virtual_competitions)

  def combined_competitions = combined_categories.values.flat_map(&:values)
end

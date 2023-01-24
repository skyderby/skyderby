class VirtualCompetition::Group::OverallStandingRow < ApplicationRecord
  belongs_to :group, class_name: 'VirtualCompetition::Group'
  belongs_to :profile

  enum suits_kind: Suit::TYPES

  def results
    super.transform_keys { |key| VirtualCompetition.disciplines.key(key.to_i) }
  end

  private

  def readonly? = true
end

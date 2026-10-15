class VirtualCompetition::Favorite < ApplicationRecord
  belongs_to :user
  belongs_to :virtual_competition

  validates :virtual_competition_id, uniqueness: { scope: :user_id }
end

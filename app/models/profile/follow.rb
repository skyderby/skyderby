class Profile::Follow < ApplicationRecord
  belongs_to :user
  belongs_to :profile

  validates :profile_id, uniqueness: { scope: :user_id }
end
